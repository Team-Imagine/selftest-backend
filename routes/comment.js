var express = require("express");
var router = express.Router();

const { Comment } = require("../models");

// 전체 comment List 불러옴
router.get("/all", async (req, res, next) => {
  try {
    const comments = await Comment.findAll({
      attributes: ["id", "content", "createdAt", "user_id", "commentable_entity_id"],
      order: [["id", "DESC"]],
      // limit: 10, // 10개씩 표시
    });

    if (comments.length == 0) {
      return res.json({
        success: false,
        message: "등록된 comment가 없습니다.",
      });
    }
    res.status(200).json({
      success: true,
      message: "등록된 comment 목록 조회에 성공했습니다.",
      commentss,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "DB 오류",
    });
  }
});

// 해당 유저의 comment List 불러옴
router.get("/:user_id", async (req, res, next) => {
  try {
    const comments = await Comment.findAll({
      attributes: ["id", "content", "createdAt", "user_id", "commentable_entity_id"],
      where: { user_id: req.params.user_id },
      order: [["id", "DESC"]],
      // limit: 10, // 10개씩 표시
    });

    if (comments.length == 0) {
      return res.json({
        success: false,
        message: "해당 유저의 등록된 comment가 없습니다.",
      });
    }
    res.status(200).json({
      success: true,
      message: "해당 유저의 등록된 comment 목록 조회에 성공했습니다.",
      commentss,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "DB 오류",
    });
  }
});

// CREATE // take comment from react page & store data to db
router.post("/", async (req, res, next) => {
  const { content, user_id, commentable_entity_id } = req.body;

  try {
    await Comment.create({
      content,
      user_id,
      commentable_entity_id,
    });

    return res.json({
      success: true,
      message: "comment가 성공적으로 등록되었습니다.",
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
  const { content, commentable_entity_id } = req.body;
  try {
    await Comment.update({ comment: content }, { where: { id: commentable_entity_id } });

    return res.status(200).json({
      success: true,
      message: "comment 내용을 성공적으로 갱신했습니다.",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "해당 id를 가진 comment가 존재하지 않습니다.",
    });
  }
});

router.delete("/", async (req, res, next) => {
  const { commentable_entity_id } = req.body;
  try {
    await Comment.destroy({ where: { id: commentable_entity_id } });

    return res.status(200).json({
      success: true,
      message: "해당 comment를 삭제하는 데 성공했습니다.",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "해당 id를 가진 comment가 존재하지 않습니다.",
    });
  }
});

module.exports = router;
