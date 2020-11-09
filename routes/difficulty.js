var express = require("express");
var router = express.Router();
const { Question, Difficulty } = require("../models");
const { isLoggedIn, getLoggedInUserId } = require("./middlewares");

// 주어진 문제 ID에 해당하는 문제에 대해 로그인한 사용자가 난이도를 평가했는지 여부를 확인
router.get("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user_id = await getLoggedInUserId(req, res); // 로그인한 사용자 ID
    const question_id = req.params.id; // 문제 ID

    // 해당 ID를 가진 문제가 존재하는지 확인
    const question = await Question.findOne({ where: { id: question_id } });
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID를 가진 문제가 존재하지 않습니다",
      });
    }

    // 난이도를 평가한 적이 있는지 확인
    const is_difficulty_evaluated = (await Difficulty.findOne({ where: { question_id, user_id } })) ? true : false;

    return res.status(200).json({
      success: true,
      message: "난이도 평가 여부를 성공적으로 확인했습니다",
      is_difficulty_evaluated,
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

// 주어진 문제 ID에 해당하는 문제에 대해 난이도를 평가
router.post("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user_id = await getLoggedInUserId(req, res); // 로그인한 사용자 ID
    const question_id = req.params.id; // 문제 ID
    const { score } = req.body; // 평가할 난이도 점수

    // 해당 ID를 가진 문제가 존재하는지 확인
    const question = await Question.findOne({ where: { id: question_id } });
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID를 가진 문제가 존재하지 않습니다",
      });
    }

    // 난이도를 평가한 적이 있는지 확인
    const existing_difficulty = await Difficulty.findOne({ where: { question_id, user_id } });
    if (existing_difficulty) {
      return res.status(400).json({
        success: false,
        error: "entryAlreadyExists",
        message: "해당 ID를 가진 문제의 난이도를 이미 평가한 적이 있습니다",
      });
    }

    // 난이도 범위에서 어긋나는지 확인
    if (score < 0 || score > 10) {
      return res.status(400).json({
        success: false,
        error: "invalidRange",
        message: "평가할 수 있는 난이도 범위에서 벗어났습니다",
      });
    }

    await Difficulty.create({ score, question_id, user_id });

    return res.json({
      success: true,
      message: "해당 문제에 대해 난이도를 성공적으로 등록하였습니다",
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

router.put("/:id", async (req, res, next) => {
  try {
    const user_id = await getLoggedInUserId(req, res); // 로그인한 사용자 ID
    const question_id = req.params.id; // 문제 ID
    const { score } = req.body; // 평가할 난이도 점수

    // 해당 ID를 가진 문제가 존재하는지 확인
    const question = await Question.findOne({ where: { id: question_id } });
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID를 가진 문제가 존재하지 않습니다",
      });
    }

    // 해당 ID를 가진 문제를 평가한 적이 있는지 확인
    const existing_difficulty = await Difficulty.findOne({ where: { question_id, user_id } });
    if (!existing_difficulty) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID를 가진 문제의 난이도를 평가한 적이 없습니다",
      });
    }

    // 난이도 범위에서 어긋나는지 확인
    if (score < 0 || score > 10) {
      return res.status(400).json({
        success: false,
        error: "invalidRange",
        message: "평가할 수 있는 난이도 범위에서 벗어났습니다",
      });
    }

    await Difficulty.update({ score }, { where: { user_id, question_id } });

    return res.json({
      success: true,
      message: "해당 문제에 대한 난이도를 성공적으로 수정하였습니다",
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

router.delete("/:id", async (req, res, next) => {
  try {
    const user_id = await getLoggedInUserId(req, res); // 로그인한 사용자 ID
    const question_id = req.params.id; // 문제 ID

    // 해당 ID를 가진 문제가 존재하는지 확인
    const question = await Question.findOne({ where: { id: question_id } });
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID를 가진 문제가 존재하지 않습니다",
      });
    }

    // 해당 ID를 가진 문제를 평가한 적이 있는지 확인
    const existing_difficulty = await Difficulty.findOne({ where: { question_id, user_id } });
    if (!existing_difficulty) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID를 가진 문제의 난이도를 평가한 적이 없습니다",
      });
    }

    await Difficulty.destroy({ where: { user_id, question_id } });

    return res.status(200).json({
      success: true,
      message: "해당 문제에 대한 평가한 난이도를 삭제하는데 성공하였습니다",
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
