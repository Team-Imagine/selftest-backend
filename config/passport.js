const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { User } = require("../models");
require("dotenv").config();

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // 클라이언트에서 서버로 JWT 전달 (Bearer)
opts.secretOrKey = process.env.JWT_SECRET;
opts.issuer = "selftest.com";

const verifyUser = async (jwt_payload, done) => {
  console.log("payload");
  try {
    const user = await User.findOne({ where: { id: jwt_payload.id, deleted_at: { $eq: null } } });
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    console.log(err);
    return done(err, false);
  }
};

module.exports = (passport) => {
  passport.use(new JwtStrategy(opts, verifyUser));
};
