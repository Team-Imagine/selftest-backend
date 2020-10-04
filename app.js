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
const bookmarkRouter = require("./routes/bookmark");
const commentRouter = require("./routes/comment");
const commentable_entityRouter = require("./routes/commentable_entity");
const courseRouter = require("./routes/course");
const difficultyRouter = require("./routes/difficulty");
const evaluatable_entityRouter = require("./routes/evaluatable_entity");
const evaluationRouter = require("./routes/evaluation");
const penaltyRouter = require("./routes/penalty");
const pointRouter = require("./routes/point");
const questionRouter = require("./routes/question");
const subjectRouter = require("./routes/subject");
const test_questionRouter = require("./routes/test_question");
const test_setRouter = require("./routes/test_set");

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
app.use("/answer", answerRouter);
app.use("/comment", commentRouter);
app.use("/bookmark", bookmarkRouter);
app.use("/commentable_entity", commentable_entityRouter);
app.use("/course", courseRouter);
app.use("/difficulty", difficultyRouter);
app.use("/evaluatable_entity", evaluatable_entityRouter);
app.use("/evaluation", evaluationRouter);
app.use("/penalty", penaltyRouter);
app.use("/point", pointRouter);
app.use("/question", questionRouter);
app.use("/subject", subjectRouter);
app.use("/test_question", test_questionRouter);
app.use("/test_set", test_setRouter);
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
