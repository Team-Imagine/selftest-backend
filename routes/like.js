var express = require("express");
var router = express.Router();

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
    return res.json({
      success: false,
      message: "해당 문제에 해당하는 Like가 존재하지 않습니다.",
    });
  }
});

// CREATE // take like from react page & store data to db
router.post("/", async (req, res, next) => {
  const { good, likeable_entity_id, user_id } = req.body;

  try {
    await Like.create({
      good,
      likeable_entity_id,
      user_id,
    });

    res.status(200).json({
      success: true,
      message: "Like가 성공적으로 등록되었습니다.",
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
  const { likeable_entity_id } = req.body;

  await Like.destroy({ where: { id: likeable_entity_id } })
    .then((result) => {

    })
    .catch((error) => {
      console.error(error);
      return res.json({
        success: false,
        message: "DB 오류",
      });
    })
});

module.exports = router;