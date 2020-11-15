var express = require("express");
var router = express.Router();
const { CommentableEntity, Comment, User } = require("../models");
const { isLoggedIn, getLoggedInUserId } = require("./middlewares");
const sanitizeHtml = require("sanitize-html");

router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    // 쿼리 기본값
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 10;
    let commentable_entity_id = req.query.commentable_entity_id; // 댓글 객체 ID
    let username = req.query.username; // 사용자 닉네임

    let queryOptions = {
      attributes: ["id", "content", "createdAt", "updatedAt"],
      where: {},
      include: [
        { model: User, attributes: ["username"], where: {} },
        { model: CommentableEntity, attributes: ["id", "entity_type"] },
      ],
      order: [["createdAt", "ASC"]], // 생성된 순서로 정렬
      offset: (+page - 1) * per_page,
      limit: +per_page,
    };

    // 댓글 객체 ID가 주어졌다면 댓글 객체 ID로 검색
    if (commentable_entity_id) {
      queryOptions.where.commentable_entity_id = commentable_entity_id;
    }

    // 댓글을 올린 사용자 닉네임이 주어졌다면 사용자 닉네임으로 검색
    if (username) {
      queryOptions.include[0].where.username = username;
    }

    // 댓글 조회
    const comments = await Comment.findAll(queryOptions);

    return res.json({
      success: true,
      message: "등록된 댓글 목록 조회에 성공했습니다",
      comments,
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

// 댓글 ID에 따른 댓글 하나의 정보를 가져옴
router.get("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const comment = await Comment.findOne({
      attributes: ["id", "content", "createdAt", "updatedAt"],
      where: { id: req.params.id },
      include: [
        { model: User, attributes: ["username"], where: {} },
        { model: CommentableEntity, attributes: ["id", "entity_type"] },
      ],
    });

    if (!comment) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID에 해당하는 댓글이 존재하지 않습니다",
      });
    }

    return res.json({
      success: true,
      message: "등록된 댓글 조회에 성공했습니다",
      comment,
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

// 로그인한 사용자 ID로 댓글 객체에 댓글을 추가한다
router.post("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const commentable_entity_id = req.params.id; // 댓글 객체 ID
    let content = req.body.content; // 추가할 댓글 내용

    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 문제 내용에서 스크립트 제거 (XSS 방지)
    content = sanitizeHtml(content);

    // 수정할 댓글 내용이 존재하는지 확인
    if (!content) {
      return res.status(400).json({
        success: false,
        error: "contentNotEnough",
        message: "등록할 댓글 내용이 부족합니다",
      });
    }

    // 댓글 등록
    await Comment.create({
      content,
      user_id,
      commentable_entity_id,
    });

    return res.json({
      success: true,
      message: "댓글이 성공적으로 등록되었습니다",
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

// 로그인한 사용자 ID로 댓글 객체의 댓글 하나를 수정한다
router.put("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id; // 댓글 ID
    let content = req.body.content; // 수정할 댓글 내용

    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 접속한 사용자의 ID와 query에 있는 댓글의 user_id룰 를 대조
    const comment = await Comment.findOne({ where: { id } });
    if (comment.user_id !== user_id) {
      return res.status(401).json({
        success: false,
        error: "userMismatches",
        message: "자신이 올린 댓글만 내용을 수정할 수 있습니다",
      });
    }

    // 문제 내용에서 스크립트 제거 (XSS 방지)
    content = sanitizeHtml(content);

    // 수정할 댓글 내용이 존재하는지 확인
    if (!content) {
      return res.status(400).json({
        success: false,
        error: "contentNotEnough",
        message: "수정할 댓글 내용이 부족합니다",
      });
    }

    // 댓글 수정
    await Comment.update({ content }, { where: { id, user_id } });

    return res.json({
      success: true,
      message: "댓글 내용을 성공적으로 수정했습니다",
      comment: { id: comment.id },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "entryNotExists",
      message: "해당 ID를 가진 댓글이 존재하지 않습니다",
    });
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id; // 삭제할 댓글 ID

    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 접속한 사용자의 ID와 query에 있는 댓글의 user_id룰 를 대조
    const comment = await Comment.findOne({ where: { id } });
    if (comment.user_id !== user_id) {
      return res.status(401).json({
        success: false,
        error: "userMismatches",
        message: "자신이 올린 댓글만 내용을 삭제할 수 있습니다",
      });
    }

    // 댓글 삭제
    await Comment.destroy({ where: { id, user_id } });

    return res.json({
      success: true,
      message: "해당 댓글을 삭제하는 데 성공했습니다",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "entryNotExists",
      message: "해당 ID를 가진 댓글이 존재하지 않습니다",
    });
  }
});

module.exports = router;
