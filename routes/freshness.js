var express = require("express");
var router = express.Router();

const { Freshness } = require("../models");

// freshness

// CREATE // take freshness from react page & store data to db

router.post("/", async (req, res, next) => {
  const { question_id, user_id, fresh } = req.body;

  try {
    const freshness = await Freshness.create({
      fresh,
      question_id,
      user_id,
    });
    return res.status(200).json({
      success: true,
      message: "신선도가 성공적으로 등록되었습니다.",
      freshness,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "DB 오류",
    });
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const { user_id, question_id } = req.body;

    const result = await Freshness.destroy({ where: { user_id: user_id, question_id: question_id } });

    return res.status(200).json({
      success: true,
      message: "문제에 대해 평가한 신선도를 삭제하는데 성공했습니다.",
      result,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "DB 오류",
    });
  }

});



module.exports = router;