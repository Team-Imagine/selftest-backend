const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize").Sequelize;
const { User, Question, QuestionSolvedLog } = require("../models");

const NUM_USERS = 50; // 랭킹 조회할 사용자 수

// 사용자 랭킹 조회
router.get("/", async (req, res, next) => {
  try {
    // 쿼리 기본값
    let page = req.query.page || 1;
    let per_page = req.query.per_page || NUM_USERS;

    let queryOptions = {
      attributes: [
        "id",
        "username",
        [Sequelize.fn("COUNT", Sequelize.col("questions.id")), "num_uploaded_questions"],
        [Sequelize.fn("COUNT", Sequelize.col("question_solved_logs.id")), "num_solved_questions"],
      ],
      include: [
        { model: Question, attributes: [], duplicating: false },
        { model: QuestionSolvedLog, attributes: [], duplicating: false },
      ],
      group: ["User.id"], // user.id
      where: { active: true, verified: true }, // 이메일 인증되어 있고 정지되지 않은 사람만 조회
      order: [
        [Sequelize.fn("COUNT", Sequelize.col("question_solved_logs.id")), "DESC"], // 1. 문제를 많이 푼 순
        [Sequelize.fn("COUNT", Sequelize.col("questions.id")), "DESC"], // 2. 문제를 많이 올린 순
      ],
      offset: (+page - 1) * per_page,
      limit: +per_page,
      distinct: true, // to fix count values
      // raw: true,
    };

    const ranks = await User.findAndCountAll(queryOptions);
    ranks.count = ranks.count.length;

    return res.json({
      success: true,
      message: "등록된 사용자 랭킹 조회에 성공했습니다",
      ranks,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "요청 오류",
    });
  }
});

module.exports = router;
