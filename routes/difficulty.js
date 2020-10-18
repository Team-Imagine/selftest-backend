var express = require("express");
var router = express.Router();

const { averageDifficulty } = require("./middlewares");
const { Difficulty } = require("../models");

// CREATE
router.post("/", async (req, res, next) => {
  const { score, question_id, user_id } = req.body;

  try {
    const difficulty = await Difficulty.create({
      score,
      question_id,
      user_id,
    });

    let t_difficulty = await averageDifficulty(question_id);

    return res.status(200).json({
      success: true,
      message: "난이도가 성공적으로 등록되었습니다.",
      t_difficulty,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "DB 오류",
    });
  }
});

router.put("/", async (req, res, next) => {
  const { score, user_id, question_id } = req.body;
  try {
  await Difficulty.update({ score: score }, {
    where: {
      user_id: user_id,
      question_id: question_id,
    }
  })

  let t_difficulty = await averageDifficulty(question_id);

  return res.status(200).json({
    success: true,
    message: "난이도가 성공적으로 수정되었습니다.",
    t_difficulty,
  });
} catch (error) {
  console.error(error);
  return res.status(400).json({
    success: false,
    message: "DB 오류",
  });
}
});

router.delete("/", async (req, res, next) => {
  const { question_id, user_id } = req.body;

  try {
    const result = await Difficulty.destroy({ where: { user_id: user_id, question_id: question_id } });

    return res.status(200).json({
      success: true,
      message: "문제에 대해 평가한 난이도를 삭제하는데 성공했습니다.",
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "DB 오류",
    });
  }
});

module.exports = router;