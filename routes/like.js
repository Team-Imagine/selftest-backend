var express = require("express");
var router = express.Router();

const { totalLike, totalDislike, givePoint } = require("./middlewares");

const { Like } = require("../models");


// 문제 id에 따른 Like 한 유저 id 목록을 가져온다.
router.get("/:likeable_entity_id", async (req, res, next) => {
  try {
    const userIDs = await Like.findAll({
      attributes: ["user_id", "createdAt"],
      where: { likeable_entity_id: req.params.likeable_entity_id },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      success: true,
      userIDs,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "해당 문제에 해당하는 Like가 존재하지 않습니다.",
    });
  }
});


router.post("/test", async (req, res, next) => {
  //const { user_id, content } = req.body;
  try {
    await givePoint(req, res);

    return res.json({
      success: true,
      message: "성공",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "DB 오류",
    });
  }
});


// CREATE
router.post("/", async (req, res, next) => {
  const { good, likeable_entity_id, user_id } = req.body;
  
  try {
    await Like.create({
      good,
      likeable_entity_id,
      user_id,
    });

    let t_like = await totalLike(likeable_entity_id);
    let t_dislike = await totalDislike(likeable_entity_id);

    res.status(200).json({
      success: true,
      message: "Like가 성공적으로 등록되었습니다.",
      t_like,
      t_dislike,
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
  const { likeable_entity_id, user_id } = req.body;

  try {
    const result = await Like.destroy({ where: { user_id: user_id, likeable_entity_id: likeable_entity_id } });

    return res.status(200).json({
      success: true,
      message: "문제에 대해 평가한 좋아요를 삭제하는데 성공했습니다.",
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