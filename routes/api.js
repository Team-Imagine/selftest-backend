var express = require("express");
var router = express.Router();

// routers
const authRouter = require("./auth");
const userRouter = require("./user");
const subjectRouter = require("./subject");
const courseRouter = require("./course");
const questionRouter = require("./question");
const answerRouter = require("./answer");
const freshnessRouter = require("./freshness");
const likeRouter = require("./like");
const difficultyRouter = require("./difficulty");
const commentRouter = require("./comment");

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/subject", subjectRouter);
router.use("/course", courseRouter);
router.use("/question", questionRouter);
router.use("/answer", answerRouter);
router.use("/freshness", freshnessRouter);
router.use("/like", likeRouter);
router.use("/difficulty", difficultyRouter);
router.use("/comment", commentRouter);

module.exports = router;
