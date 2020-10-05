const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const { User } = require("../models");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        // 값: 키에 해당하는 req.body의 속성명
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // 이메일로 가입된 회원 확인
          const existingUser = await User.find({ where: { email } });

          if (existingUser) {
            // 가입한 회원이라면 비밀번호를 대조
            const result = await bcrypt.compare(password, existingUser.password);
            if (result) {
              done(null, existingUser);
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다" });
            }
          } else {
            done(null, false, { message: "가입되지 않은 회원입니다." });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
