const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

// TODO: 테스트 이후 헤더가 아닌 쿠키에서만 검증 (logout 기능 구현)
// TODO: 비밀번호 변경시 시간 기록 및 비교 (재인증)
const isLoggedIn = async function (req, res, next) {
  console.log("로그인했는지 확인 중");

  if (req.headers.authorization) {
    // 헤더나 request.user에 토큰 존재
    console.log("req.headers.authorization:", req.headers.authorization);
    const token = req.headers.authorization.split("Bearer ")[1] || req.user.split("Bearer ")[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        // 토큰이 유효하지 않을 경우
        res.status(401).json({
          success: false,
          message: "로그인 인증 에러 - 토큰이 유효하지 않음",
        });
      } else {
        // 토큰이 유효할 경우
        try {
          // 사용자가 삭제됐는지 확인
          const user = await User.findOne({ where: { id: decoded.id, deleted_at: null } });
          if (user) {
            // 사용자가 시스템에 존재할 경우
            console.log("로그인 성공");
            next();
          } else {
            // 사용자 계정 탈퇴/삭제한 경우
            res.status(403).json({
              success: false,
              message: "로그인 인증 에러 - 사용자 존재하지 않음",
            });
          }
        } catch (error) {
          res.status(403).json({
            success: false,
            message: "로그인 인증 에러 - DB 오류",
          });
        }
      }
    });
  } else {
    // 헤더에 토큰 없음
    res.status(401).json({ error: "로그인 인증 에러 - 헤더에 토큰 없음" });
  }
};

// JWT 토큰 유효 검증 함수
const validate_jwt = function (req, res) {
  return new Promise((resolve, reject) => {
    let accesstoken = req.cookies.access_token || null;
    let refreshtoken = req.cookies.refresh_token || null;

    // 쿠키에서 두 토큰이 둘 다 존재하는지 확인
    if (accesstoken && refreshtoken) {
      // access 토큰 검증
      jwt.verify(accesstoken, process.env.JWT_SECRET, async (err, decoded) => {
        try {
          if (err) {
            // access 토큰의 expiration 기한이 지나 유효하지 않은 경우,
            // refresh 토큰을 이용해 새 access 토큰 갱신
            if (err.name === "TokenExpiredError") {
              console.log("토큰 만료 기간 지남 (TokenExpiredError)");
              // Redis가 expire 됐다는 것은 Redis에 최소 한 번은 들어갔단 뜻이므로,
              // Redis에서 토큰을 찾을 수 있는지 확인
              const decoded_uid = jwt.decode(accesstoken, process.env.JWT_SECRET).uid;

              await req.client.get(decoded_uid, function (err, val) {
                let redis_token = err ? null : val ? JSON.parse(val) : null;

                // Redis에 토큰이 존재하지 않는다면,
                // 또는 브라우저가 Redis에 존재하지 않는 또다른 refresh 토큰을 보냈다면,
                if (!redis_token || redis_token.refresh_token !== refreshtoken) {
                  // hacking 시도 감지
                  // 해당 사용자에 대해서, 해당 값을 가진 refresh 토큰이 없거나
                  // 또는 refresh token이 request로부터 온 것과 storage로부터 온 것이 다르다는 것을 의미
                  reject("Nice try.");
                } else {
                  // refresh 토큰이 expire된 경우
                  // access 토큰과 refresh token 둘다 새로 갱신
                  console.log(new Date(redis_token.expires) < new Date());
                  if (new Date(redis_token.expires) < new Date()) {
                    console.log("Refresh 토큰 만료 기간 지남 - 새로 갱신");
                    // refresh 토큰이 expire 됐으므로 갱신
                    let refresh_token = generateRefreshToken(req, decoded_uid);

                    // 해당 refesh token을 response 객체를 이용해 httpOnly 쿠키에 저장
                    // localhost면 secure option을 끄고 HTTPS라면 켤 것
                    res.cookie("refresh_token", refresh_token, {
                      // secure: true,
                      httpOnly: true,
                    });

                    // refresh 토큰의 expiration 기한을 JWT refresh expiration 기간만큼 초기화/업데이트 (refresh)
                    let refresh_token_maxage = new Date() + req.app.get("jwt_refresh_expiration");
                    console.log("refresh_token_maxage:", refresh_token_maxage);

                    // Redis에 저장
                    req.client.set(
                      decoded_uid,
                      JSON.stringify({
                        refresh_token: refresh_token,
                        expires: refresh_token_maxage,
                      }),
                      req.client.print
                    );
                  }

                  // access token 발행
                  // 사용자 ID를 JWT payload에 저장함을 유념할 것
                  const payload = { uid: decoded_uid };
                  let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: req.app.get("jwt_expiration") });
                  // 다시 한 번 토큰을 httpOnly 쿠키에 저장
                  res.cookie("access_token", token, {
                    // secure: true,
                    httpOnly: true,
                  });
                  // 나중에 다시 쓸 수 있게 modified request, response 객체 반환
                  resolve({ res: res, req: req });
                }
              });
            } else {
              // "TokenExpiredError"가 아닌 다른 에러 발생
              // (토큰이 유효하지 않거나 이상한 포맷으로 작성되는 등)
              reject(err);
            }
          } else {
            // 인증 성공
            // (access 토큰이 유효하고 토큰 기한도 만료되지 않음)
            resolve({ res: res, req: req });
          }
        } catch (error) {
          console.error(error);
          reject("인증 오류");
        }
      });
    } else {
      // 토큰이 없는데 로그인하려고 할 경우
      reject("토큰 존재하지 않음.");
    }
  });
};

// A little helper function for generation of refresh tokens
const generateRefreshToken = function (req, uid) {
  const refresh_token = jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: req.app.get("jwt_refresh_expiration") });
  return refresh_token;
  // var text = "";
  // var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  // for (var i = 0; i < len; i++) {
  //   text += charset.charAt(Math.floor(Math.random() * charset.length));
  // }
  // return text;
};

module.exports = {
  isLoggedIn,
  validate_jwt,
  generateRefreshToken,
};
