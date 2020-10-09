const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models");
require("dotenv").config();

const router = express.Router();

router.post("/register", async (req, res, next) => {
  const { email, username, password, first_name, last_name } = req.body;
  try {
    // 동일한 이메일로 가입한 사용자가 있는지 확인
    let existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        joinSuccess: false,
        msg: "이미 동일한 이메일로 가입한 사용자가 존재합니다.",
      });
    }

    existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        joinSuccess: false,
        msg: "이미 동일한 닉네임으로 가입한 사용자가 존재합니다.",
      });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      username,
      password: hash,
      first_name,
      last_name,
    });
    return res.status(200).json({
      joinSuccess: true,
      msg: "가입에 성공했습니다.",
    });
  } catch (error) {
    return res.json({
      joinSuccess: false,
      msg: "DB 오류",
    });
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  // 이메일로 사용자 조회
  const user = await User.findOne({ where: { email }, raw: true });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "해당하는 회원이 존재하지 않습니다.",
    });
  }

  // 비밀번호 확인
  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    // 비밀번호가 일치할 경우, JWT payload 생성
    const payload = {
      id: user.id,
      username: user.username,
    };

    // JWT 토큰 생성
    // 1시간 동안 유효
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      res.json({
        success: true,
        token: "Bearer " + token,
      });
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "패스워드가 일치하지 않습니다.",
    });
  }
});

// TODO: 세션 사용하지 않으므로 JWT에 맞게 수정 요망 (Redis 도입 이후 추후 구현)
// router.get("/logout", isLoggedIn, (req, res) => {
//   req.logout();
//   req.session.destroy();
//   res.status(200).json({
//     logoutSuccess: true,
//   });
// });

module.exports = router;
