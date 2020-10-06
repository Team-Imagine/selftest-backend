const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { User } = require("../models");

const router = express.Router();

router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, username, password, first_name, last_name } = req.body;
  try {
    // 동일한 이메일로 가입한 사용자가 있는지 확인
    let existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.json({
        joinSuccess: false,
        msg: "이미 동일한 이메일로 가입한 사용자가 존재합니다.",
      });
    }

    existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.json({
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
    });
  } catch (error) {
    return res.json({
      joinSuccess: false,
      msg: "DB 오류",
    });
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      req.flash("loginError", info.message);
      return res.redirect("/");
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.status(200).json({
        loginSuccess: true,
        user_id: user.id,
        redirect: "/",
      });
    });
  })(req, res, next);
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.status(200).json({
    logoutSuccess: true,
  });
});

module.exports = router;
