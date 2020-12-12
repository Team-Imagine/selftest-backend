var express = require("express");
var router = express.Router();

// routers
const authRouter = require("./auth");
const userRouter = require("./user");
const attendanceRouter = require("./attendance");
const subjectRouter = require("./subject");
const courseRouter = require("./course");
const questionRouter = require("./question");
const answerRouter = require("./answer");
const freshnessRouter = require("./freshness");
const likeRouter = require("./like");
const dislikeRouter = require("./dislike");
const difficultyRouter = require("./difficulty");
const commentRouter = require("./comment");
const bookmarkRouter = require("./bookmark");
const testSetRouter = require("./testset");
const rankRouter = require("./rank");
const imageRouter = require("./image");

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/attendance", attendanceRouter);
router.use("/subject", subjectRouter);
router.use("/course", courseRouter);
router.use("/question", questionRouter);
router.use("/answer", answerRouter);
router.use("/freshness", freshnessRouter);
router.use("/like", likeRouter);
router.use("/dislike", dislikeRouter);
router.use("/difficulty", difficultyRouter);
router.use("/comment", commentRouter);
router.use("/bookmark", bookmarkRouter);
router.use("/testset", testSetRouter);
router.use("/rank", rankRouter);
router.use("/image", imageRouter);

module.exports = router;
