var express = require("express");
var router = express.Router();

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
    return res.status(200).json({
      success: true,
      message: "난이도가 성공적으로 등록되었습니다.",
      difficulty,
    });
  } catch (error) {
    console.error(error);
    return res.json({
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
} catch (error) {
  console.error(error);
  return res.json({
    success: false,
    message: "DB 오류",
  });
}
});

router.delete("/", async (req, res, next) => {
  const { user_id, question_id } = req.body;

  await Difficulty.destroy({
    where: {
      user_id: user_id,
      question_id: question_id,
    }
  })
    .then((result) => {

    })
    .catch((err) => {
      console.error(err);
      next(err);
    })
});



module.exports = router;