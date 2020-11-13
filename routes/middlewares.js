const jwt = require("jsonwebtoken");
const { PointLog, User, Freshness, Like, Difficulty, PenaltyLog } = require("../models");
require("dotenv").config();

const express = require("express");
const router = express.Router();

// 사용자가 정지 상태인지, 이메일 인증은 받았는지 여부는 검사하지 않고 로그인 되어 있는지 검사
const isJustLoggedIn = async function (req, res, next) {
  try {
    const user = await getLoggedInUserInfo(req, res);

    // 로그인 되어있지 않은 경우
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "userNotLoggedIn",
        message: "로그인 되어 있지 않습니다",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      error: error,
      message: "로그인 되어 있지 않습니다",
    });
  }
};

// 로그인 되어 있는지, 정지 상태거나 이메일 인증을 받지 않은 것은 아닌지 검사
const isLoggedIn = async function (req, res, next) {
  try {
    const user = await getLoggedInUserInfo(req, res);

    // 로그인 되어있지 않은 경우
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "userNotLoggedIn",
        message: "로그인 되어 있지 않습니다",
      });
    }

    // 이메일 인증이 안돼있을 경우
    if (!user.verified) {
      return res.status(401).json({
        success: false,
        error: "userNotEmailVerified",
        message: "사용자가 이메일 인증이 되어 있지 않습니다",
      });
    }

    // 사용자가 정지 상태인 경우
    if (!user.active) {
      return res.status(401).json({
        success: false,
        error: "userNotActive",
        message: "사용자가 정지 상태입니다",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      error: error,
      message: "로그인 되어 있지 않습니다",
    });
  }
};

const isNotLoggedIn = async function (req, res, next) {
  try {
    const result = await validateJwt(req, res);

    if (!result) {
      next();
    } else {
      return res.status(401).json({
        success: false,
        error: "userAlreadyLoggedIn",
        message: "로그인이 이미 되어있습니다",
      });
    }
  } catch (error) {
    next();
  }
};

// JWT 토큰 유효 검증 함수
const validateJwt = function (req, res) {
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
                  reject("refreshTokenDiffersFromServer");
                } else {
                  // refresh 토큰이 expire된 경우
                  // access 토큰과 refresh token 둘다 새로 갱신
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
                    let refresh_token_maxage = new Date();
                    refresh_token_maxage.setSeconds(
                      refresh_token_maxage.getSeconds() + req.app.get("jwt_refresh_expiration")
                    );
                    console.log(refresh_token_maxage);

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
                    httpOnly: false,
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
          reject("tokenValidationFails");
        }
      });
    } else {
      // 토큰이 없는데 로그인하려고 할 경우
      reject("tokenNotExists");
    }
  });
};

// A little helper function for generation of refresh tokens
const generateRefreshToken = function (req, uid) {
  const refresh_token = jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: req.app.get("jwt_refresh_expiration") });
  return refresh_token;
};

// 접속한 사용자의 정보를 불러오는 함수 - 사용하려는 라우트에서 isLoggedIn이 미들웨어로 반드시 존재해야 함
// 인증에 오류가 있을시 null 반환
const getLoggedInUserInfo = async function (req, res) {
  try {
    await validateJwt(req, res);

    // 사용자 브라우저 토큰을 가져와 접속한 사용자 id를 읽음
    let accesstoken = req.cookies.access_token || null;
    const decoded_uid = jwt.decode(accesstoken, process.env.JWT_SECRET).uid;
    const user = await User.findOne({
      attributes: [
        "id",
        "email",
        "username",
        "first_name",
        "last_name",
        "phone_number",
        "point",
        "verified",
        "active",
        "created_at",
      ],
      where: { id: decoded_uid },
      raw: true,
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 접속한 사용자의 id를 불러오는 함수 - 사용하려는 라우트에서 isLoggedIn이 미들웨어로 반드시 존재해야 함
// 인증에 오류가 있을시 null 반환
const getLoggedInUserId = async function (req, res) {
  try {
    await validateJwt(req, res);

    // 사용자 브라우저 토큰을 가져와 접속한 사용자 id를 읽음
    let accesstoken = req.cookies.access_token || null;
    const decoded_uid = jwt.decode(accesstoken, process.env.JWT_SECRET).uid;
    const user = await User.findOne({ where: { id: decoded_uid } });
    return user.id;
  } catch (error) {
    return null;
  }
};

// 항목에 부여된 좋아요 점수를 합산하는 함수
const totalLike = async (likeable_entity_id) => {
  try {
    let likes = await Like.count({
      where: { likeable_entity_id, good: true },
    });

    return likes;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 항목에 부여된 싫어요 점수를 합산하는 함수
const totalDislike = async (likeable_entity_id) => {
  try {
    let dislikes = await Like.count({
      where: { likeable_entity_id, good: false },
    });

    return dislikes;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 항목에 부여된 좋아요, 싫어요 점수를 합산하는 함수
const totalFinalLike = async (likeable_entity_id) => {
  try {
    let likes = await totalLike(likeable_entity_id);

    console.log("likes:", likes);
    let dislikes = await totalDislike(likeable_entity_id);
    console.log("dislikes:", dislikes);
    return likes - dislikes;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 문제의 블라인드 처리를 정하는 함수
const questionBlocked = async (question_id, likeable_entity_id) => {
  try {
    let likes = await totalLike(likeable_entity_id);

    let dislikes = await totalDislike(likeable_entity_id);

    // 블라인드 조건: 싫어요 20개 이상 & 싫어요 / 좋아요  2 이상
    if (dislikes >= 20 && dislikes / likes > 2) {
      await Question.update(
        { blocked: true },
        {
          where: {
            question_id: question_id,
          },
        }
      );
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 문제에 부여된 신선도 점수를 합산하는 함수
const totalFresh = async (question_id) => {
  try {
    let freshnesses = await Freshness.count({
      where: { question_id, fresh: true },
    });

    return freshnesses;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 문제에 부여된 !신선도 점수를 합산하는 함수
const totalStale = async (question_id) => {
  try {
    let stalenesses = await Freshness.count({
      where: { question_id, fresh: false },
    });

    return stalenesses;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 문제에 부여된 신선도, !신선도 점수를 합산하는 함수
const totalFinalFresh = async (question_id) => {
  try {
    let freshness = await totalFresh(question_id);

    let stalenesses = await totalStale(question_id);

    return freshness - stalenesses;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 문제의 난이도의 평균을 산출하는 함수
const averageDifficulty = async (question_id) => {
  try {
    let difficulties =
      (await Difficulty.sum("score", {
        where: { question_id },
      })) /
      (await Difficulty.count("score", {
        where: { question_id },
      }));

    return difficulties;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 유저에게 패널티를 부여하는 함수
const givePenalty = async (req, res) => {
  const { user_id, content } = req.body;

  let termination_date = new Date();

  termination_date.setDate(termination_date.getDate() + 3);

  try {
    await PenaltyLog.create({
      termination_date,
      content,
      user_id,
    });

    await User.update(
      { active: false },
      {
        where: {
          id: user_id,
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
};

// 유저에게 포인트를 부여하는 함수
const givePoint = async (req, res) => {
  const { user_id, amount, content } = req.body;

  try {
    await PointLog.create({
      amount,
      user_id,
      content,
    });

    let userPoint = await User.findOne({
      attributes: ["point"],
      where: { id: user_id },
    });

    await User.update(
      { point: Number(userPoint.point) + Number(amount) },
      {
        where: {
          id: user_id,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "유저의 포인트 부여에 성공했습니다.",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "DB 오류",
    });
  }
};

// 한 유저의 전체 포인트 로그를 열람하는 함수
const readUserPointLog = async (req, res) => {
  const { user_id } = req.body;

  try {
    let userPointLog = await PointLog.findAll({
      attributes: ["user_id", "amount", "content", "createdAt"],
      where: { user_id },
      order: [["createdAt", "DESC"]],
    });

    if (userPointLog.length == 0) {
      return res.json({
        success: false,
        message: "등록된 포인트 로그가 없습니다.",
      });
    }
    res.status(200).json({
      success: true,
      message: "등록된 포인트 로그 조회에 성공했습니다.",
      userPointLog,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "DB 오류",
    });
  }
};

// 한 유저의 포인트를 열람하는 함수
const readUserPoint = async (req, res) => {
  const { user_id } = req.body;

  try {
    let userPoint = await User.findOne({
      attributes: ["point"],
      where: { user_id },
    });

    res.status(200).json({
      success: true,
      message: "유저의 포인트 조회에 성공했습니다.",
      userPoint,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "DB 오류",
    });
  }
};

// 생성된 전체 포인트 로그 열람하는 함수
const readTotalPointLog = async (req, res) => {
  try {
    const pointLogs = await PointLog.findAll({
      attributes: ["id", "amount", "content", "createdAt", "user_id"],
      where: {},
      order: [["id", "DESC"]],
      limit: 10, // 10개씩 표시
    });

    if (pointLogs.length == 0) {
      return res.json({
        success: false,
        message: "등록된 포인트 로그가 없습니다.",
      });
    }
    res.status(200).json({
      success: true,
      message: "등록된 포인트 로그 목록 조회에 성공했습니다.",
      pointLogs,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "DB 오류",
    });
  }
};

const similarityCheck = async (req, res) => {
  
};

module.exports = {
  isJustLoggedIn,
  isLoggedIn,
  isNotLoggedIn,
  generateRefreshToken,
  getLoggedInUserInfo,
  getLoggedInUserId,
  givePoint,
  readUserPoint,
  readUserPointLog,
  readTotalPointLog,
  totalLike,
  totalDislike,
  totalFinalLike,
  totalFresh,
  totalStale,
  totalFinalFresh,
  averageDifficulty,
  givePenalty,
  questionBlocked,
  similarityCheck,
};
