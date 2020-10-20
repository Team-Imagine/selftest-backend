const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, VerificationCode } = require("../models");
const { isLoggedIn, isNotLoggedIn, getLoggedInUserId, generateRefreshToken } = require("./middlewares");
const sendVerificationEMail = require("./bin/send_email").sendVerificationEmail;
require("dotenv").config();

const router = express.Router();

router.post("/register", isNotLoggedIn, async (req, res, next) => {
  const { email, username, password, first_name, last_name, phone_number } = req.body;
  try {
    // 동일한 이메일로 가입한 사용자가 있는지 확인
    let existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "이미 동일한 이메일로 가입한 사용자가 존재합니다",
      });
    }

    existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "이미 동일한 닉네임으로 가입한 사용자가 존재합니다",
      });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      username,
      password: hash,
      first_name,
      last_name,
      phone_number,
    });
    return res.status(200).json({
      success: true,
      message: "가입에 성공했습니다",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "가입에 실패했습니다",
    });
  }
});

// 로그인
// 토큰을 생성하고 사용자에게 반환한다 (httpOnly cookies)
router.post("/login", isNotLoggedIn, async (req, res, next) => {
  const { email, password } = req.body;

  // 이메일로 사용자 조회
  try {
    const user = await User.findOne({ where: { email }, raw: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "해당하는 회원이 존재하지 않습니다",
      });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // 비밀번호가 일치할 경우, JWT payload 생성
      const payload = {
        uid: user.id,
      };

      // JWT 토큰 생성
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: req.app.get("jwt_expiration") });

      // 새로운 refresh 토큰과 해당 expiration 생성
      let refresh_token = generateRefreshToken(req, user.id);
      let refresh_token_maxage = new Date() + req.app.get("jwt_refresh_expiration");

      // 브라우저 httpOnly 쿠키 설정
      res.cookie("access_token", token, {
        // secure: true,
        httpOnly: true,
      });
      res.cookie("refresh_token", refresh_token, {
        // secure: true,
        httpOnly: true,
      });

      // 해당 계정 id를 key로 하여 Redis 서버에 저장
      req.client.set(
        user.id,
        JSON.stringify({
          refresh_token: refresh_token,
          expires: refresh_token_maxage,
        }),
        req.client.print
      );

      return res.json({
        success: true,
        uid: user.id,
        message: "로그인 성공",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "패스워드가 일치하지 않습니다",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: "로그인 오류",
    });
  }
});

// 로그아웃 - req.body의 id를 이용해 로그아웃
router.post("/logout", isLoggedIn, async (req, res, next) => {
  try {
    // 로그인 검증
    const user_id = await getLoggedInUserId(req, res); // 현재 로그인한 사용자 ID

    // 사용자 refresh 토큰을 Redis로부터 삭제
    req.client.del(user_id, (err, response) => {
      if (response == 1) {
        console.log("Redis로부터 사용자 refresh 토큰 삭제 성공");
        // 브라우저로부터 httpOnly 쿠키도 삭제
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        res.status(200).json({
          success: true,
          message: "로그아웃 성공",
        });
      } else {
        console.log("Redis로부터 사용자 refresh 토큰 삭제 실패");
        res.status(400).json({
          success: false,
          message: "로그아웃 실패",
        });
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "로그인 되어있지 않습니다",
    });
  }
});

router.post("/profile", (req, res, next) => {
  // 쿠키가 존재하고 유효한지 확인한다
  // JWT payload를 이용해 사용자 id를 확인한다
  // ./middlewares -> isLoggedIn과 동일
});

// 가입 인증 이메일 발송
router.post("/send-verification-email", isLoggedIn, async (req, res, next) => {
  try {
    // 로그인 검증
    const user_id = await getLoggedInUserId(req, res); // 현재 로그인한 사용자 ID
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "로그인 되어있지 않습니다",
      });
    }

    const user = await User.findOne({
      where: { id: user_id },
    });
    const email = user.email; // 사용자 이메일

    // 가입 인증이 필요할 경우에만 전송
    if (user.verified) {
      return res.status(400).json({
        success: false,
        message: "가입 인증이 이미 되어있습니다",
      });
    }
    await sendVerificationEMail(email);

    return res.json({
      success: true,
      message: "가입 인증 이메일 발송에 성공했습니다",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "가입 인증 이메일 발송에 실패했습니다",
      error: error.message,
    });
  }
});

// 사용자 이메일 인증 코드 대조
// req.body에 verification_code (인증코드) 필요
router.post("/verify-email", isLoggedIn, async (req, res, next) => {
  const { verification_code } = req.body; // 가입 인증 코드

  try {
    // 로그인 검증
    const user_id = await getLoggedInUserId(req, res); // 현재 로그인한 사용자 ID

    // 사용자 정보 불러옴
    const user = await User.findOne({
      where: { id: user_id },
      raw: true,
    });

    // 가입 인증이 필요할 경우에만 전송
    if (user.verified) {
      return res.status(400).json({
        success: false,
        message: "가입 인증이 이미 되어있습니다",
      });
    }
    // 인증코드 대조
    const verification_code_in_db = await VerificationCode.findOne({
      where: { user_id: user_id, code: verification_code },
      raw: true,
    });

    // 생성 시간으로부터 인증 만료 시간이 지났는지 확인
    let expiration_time = new Date(verification_code_in_db.createdAt);
    const DURATION_IN_MINUTES = 3; // 인증 만료 시간 3분
    expiration_time.setMinutes(expiration_time.getMinutes() + DURATION_IN_MINUTES);
    console.log(expiration_time);
    console.log(new Date());

    // 현재 시간과 비교
    if (expiration_time < new Date()) {
      // 만료시간 지난 인증 코드 삭제
      await VerificationCode.destroy({
        where: { id: verification_code_in_db.id },
      });

      return res.status(400).json({
        success: false,
        message: "인증 만료 시간이 지났습니다. 코드를 다시 발급받으세요",
      });
    }

    if (verification_code_in_db) {
      // 인증 코드 삭제
      await VerificationCode.destroy({
        where: { id: verification_code_in_db.id },
      });

      // 사용자 정보 업데이트
      await User.update({ verified: true }, { where: { id: user_id } });

      return res.json({
        success: true,
        message: "인증 코드가 일치합니다. 이메일 인증에 성공했습니다",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "가입 인증에 실패했습니다. 인증 코드를 다시 확인해주세요",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "가입 인증에 실패했습니다",
    });
  }
});

module.exports = router;
