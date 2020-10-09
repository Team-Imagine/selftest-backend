const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

// TODO: 테스트 이후 헤더가 아닌 쿠키에서만 검증 (logout 기능 구현)
// TODO: 비밀번호 변경시 시간 기록 및 비교 (재인증)
exports.isLoggedIn = async (req, res, next) => {
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
