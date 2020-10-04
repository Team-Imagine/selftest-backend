const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const session = require("express-session");
require("dotenv").config();

// routers
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");
const subjectRouter = require("./routes/subject");
const courseRouter = require("./routes/course");
const questionRouter = require("./routes/question");
const answerRouter = require("./routes/answer");

const sequelize = require("./models").sequelize;

const app = express();
sequelize.sync();

// express variables
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set("port", process.env.PORT || 8002);

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
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

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/subject", subjectRouter);
app.use("/course", courseRouter);
app.use("/question", questionRouter);
app.use("/answer", answerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
