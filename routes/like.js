const express = require("express");
const router = express.Router();
const { isLoggedIn, getLoggedInUserId } = require("./middlewares");
const { Like, Dislike, LikeableEntity } = require("../models");

// 해당 좋아요 객체가 좋아요 및 싫어요 처리된 적 있는지 확인한다
router.get("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user_id = await getLoggedInUserId(req, res); // 로그인한 사용자 ID
    const likeable_entity_id = req.params.id; // 좋아요 처리를 확인할 좋아요 객체 ID

    // 해당 좋아요 객체 ID를 가진 좋아요 객체가 존재하는지 확인
    const likeable_entity = await LikeableEntity.findOne({ where: { id: likeable_entity_id }, raw: true });
    if (!likeable_entity) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 좋아요 객체 ID를 가진 객체가 존재하지 않습니다",
      });
    }

    let is_liked = (await Like.findOne({ where: { user_id, likeable_entity_id } })) ? true : false;
    let is_disliked = (await Dislike.findOne({ where: { user_id, likeable_entity_id } })) ? true : false;

    console.log(likeable_entity);
    return res.json({
      success: true,
      is_liked,
      is_disliked,
      message: "해당 객체의 좋아요 및 싫어요 상태 확인에 성공했습니다",
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

// 좋아요 객체 ID를 넘겨주면 해당 객체를 좋아요 처리 한다
router.post("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user_id = await getLoggedInUserId(req, res); // 로그인한 사용자 ID
    const likeable_entity_id = req.params.id; // 좋아요 처리할 좋아요 객체 ID

    // 해당 좋아요 객체 ID를 가진 좋아요 객체가 존재하는지 확인
    const likeable_entity = await LikeableEntity.findOne({ where: { id: likeable_entity_id }, raw: true });
    if (!likeable_entity) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 좋아요 객체 ID를 가진 객체가 존재하지 않습니다",
      });
    }

    // 기존에 있었던 싫어요를 삭제
    await Dislike.destroy({ where: { user_id, likeable_entity_id } });

    // 기존에 좋아요가 있었다면 다시 생성하지 않음
    const existing_like = await Like.findOne({ where: { user_id, likeable_entity_id }, raw: true });
    if (!existing_like) {
      await Like.create({
        good: 1,
        likeable_entity_id,
        user_id,
      });
    }

    return res.json({
      success: true,
      message: "해당 객체를 성공적으로 좋아요 처리하였습니다",
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

// 좋아요 객체 ID를 넘겨주면 해당 객체를 좋아요 취소 처리한다
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user_id = await getLoggedInUserId(req, res); // 로그인한 사용자 ID
    const likeable_entity_id = req.params.id;

    // 해당 좋아요 객체 ID를 가진 좋아요 객체가 존재하는지 확인
    const likeable_entity = await LikeableEntity.findOne({ where: { id: likeable_entity_id } });
    if (!likeable_entity) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 좋아요 객체 ID를 가진 객체가 존재하지 않습니다",
      });
    }

    const existing_like = await Like.findOne({ where: { user_id, likeable_entity_id }, raw: true });
    if (existing_like) {
      await Like.destroy({ where: { user_id, likeable_entity_id } });
    }

    return res.json({
      success: true,
      message: "해당 객체의 좋아요를 삭제하는데 성공했습니다",
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
