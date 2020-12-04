const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const session = require("express-session");
const passport = require("passport");
const redis = require("./redis_instance");
const client = redis.getConnection();
const cors = require("cors");
require("dotenv").config();

// routers
const apiRouter = require("./routes/api");

const { sequelize } = require("./models");
const passportConfig = require("./config/passport");
const { createDefaultRoles, assignRolesToLegacyUsers } = require("./routes/bin/manipulators/roles");

const app = express();
app.use(cors());

app.set("port", process.env.PORT || 8002);
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });
passportConfig(passport);

// express variables
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// JWT variables
app.set("jwt_expiration", 60 * 10);
app.set("jwt_refresh_expiration", 60 * 60 * 24 * 30);

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Redis 미들웨어 - req.client로 클라이언트를 가져올 수 있음
app.use((req, res, next) => {
  req.client = client;
  next();
});

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
app.use(passport.initialize());

// routers
app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = {
    success: false,
    message: `${req.method} ${req.url} 페이지가 존재하지 않습니다.`,
  };
  next(error);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  // error = req.app.get("env") !== "production" ? err : {};
  let error = err;

  // render the error page
  status = error.status || 500;
  message = error.message;

  res.status(err.status || 500).json({
    success: false,
    message: error.message,
  });
});

app.listen(app.get("port"), async () => {
  console.log(app.get("port"), "번 포트에서 대기 중");

  await createDefaultRoles();
  await assignRolesToLegacyUsers();
});
