const local = require("./localStrategy");
const { User } = require("../models");

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    // req.session 객체에 사용자 아이디만 저장
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    // 세선에 저장한 아이디를 통해 사용자 정보 객체 로딩
    try {
      const user = await User.findOne({ where: { id } });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  local(passport);
};
