const express = require("express");
const router = express.Router();
const {
  Question,
  User,
  Answer,
  LikeableEntity,
  CommentableEntity,
  Comment,
  Like,
  Difficulty,
  Freshness,
  Bookmark,
  TestQuestion,
  Course,
} = require("../models");
const { isLoggedIn, getLoggedInUserId } = require("./middlewares");

// 페이지네이션을 이용해 문제 리스트를 불러옴
router.get("/", async (req, res, next) => {
  try {
    // 쿼리 기본값
    let page = req.query.page || 0;
    let per_page = req.query.per_page || 10;

    // 비활성화되지 않은 문제만 불러옴
    const questions = await Question.findAll({
      attributes: ["id", "content", "createdAt"],
      where: {
        blocked: false,
      },
      include: [
        { model: User, attributes: ["username"] },
        { model: Course, attributes: ["title"] },
      ],
      offset: +page - 1,
      limit: +per_page,
    });

    return res.json({
      success: true,
      message: "등록된 문제 목록 조회에 성공했습니다",
      questions,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "요청 오류",
    });
  }
});

// 문제 id에 따른 문제 정보를 가져옴
router.get("/:id", async (req, res, next) => {
  try {
    const question = await Question.findOne({
      attributes: ["id", "content", "createdAt"],
      where: {
        id: req.params.id,
        blocked: false,
      },
      include: [
        { model: User, attributes: ["username"] },
        { model: Course, attributes: ["title"] },
      ],
    });

    if (!question) {
      return res.json({
        success: false,
        message: "해당 id에 해당하는 문제가 존재하지 않습니다",
      });
    }

    return res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "해당 id에 해당하는 문제가 존재하지 않습니다",
    });
  }
});

// 문제 생성
router.post("/", isLoggedIn, async (req, res, next) => {
  const { content, course_id } = req.body;
  try {
    // 동일하거나 유사한 문제가 있는 경우
    // TODO: 동일하거나 유사한 문제 존재시 중복문제 또는 복수정답 처리
    // ...

    // 접속한 사용자의 id를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // TODO: 수정할 문제 내용이 존재하는지 확인
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "수정할 문제 내용이 부족합니다",
      });
    }

    // 문제 생성
    const question = await Question.create({
      content,
      course_id,
      user_id,
    });

    // 생성한 문제에 댓글 및 좋아요 entity id 연결
    const commentable_entity = await CommentableEntity.create({
      entity_type: "question",
    });
    const likeable_entity = await LikeableEntity.create({
      entity_type: "question",
    });
    await Question.update(
      { commentable_entity_id: commentable_entity.id, likeable_entity_id: likeable_entity.id },
      { where: { id: question.id } }
    );

    return res.json({
      success: true,
      message: "문제가 성공적으로 등록되었습니다",
      question: { id: question.id },
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "DB 오류",
    });
  }
});

// 문제 id에 해당하는 문제 내용을 수정
router.put("/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    // 접속한 사용자의 id를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 접속한 사용자의 id와 query에 있는 문제의 user_id룰 를 대조
    const question = await Question.findOne({ where: { id: req.params.id } });
    if (question.user_id !== user_id) {
      return res.status(400).json({
        success: false,
        message: "자신이 업로드한 문제만 내용을 수정할 수 있습니다",
      });
    }

    // TODO: 수정할 문제 내용이 존재하는지 확인
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "수정할 문제 내용이 부족합니다",
      });
    }

    await Question.update({ content }, { where: { id } });
    return res.status(200).json({
      success: true,
      message: "문제 내용을 성공적으로 갱신했습니다",
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "해당 id를 가진 문제가 존재하지 않습니다",
    });
  }
});

// 문제 id에 해당하는 문제 완전 삭제
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    // 접속한 사용자의 id를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 접속한 사용자의 id와 query에 있는 문제의 user_id룰 를 대조
    const question = await Question.findOne({ where: { id: req.params.id }, raw: true });
    if (question.user_id !== user_id) {
      return res.status(400).json({
        success: false,
        message: "자신이 업로드한 문제만 삭제할 수 있습니다",
      });
    }

    // 문제 삭제
    const result = await Question.destroy({ where: { id: req.params.id } });

    // 문제에 달린 댓글 및 평가 일괄 삭제 (좋아요, 신선도, 난이도)
    const q_commentable_entity = await CommentableEntity.findOne({ where: { id: question.commentable_entity_id } });
    await CommentableEntity.destroy({ where: { id: q_commentable_entity.id } });
    await Comment.destroy({ where: { commentable_entity_id: q_commentable_entity.id } });

    const q_likeable_entity = await LikeableEntity.findOne({ where: { id: question.likeable_entity_id } });
    await LikeableEntity.destroy({ where: { id: q_likeable_entity.id } });
    await Like.destroy({ where: { likeable_entity_id: q_likeable_entity.id } });
    await Freshness.destroy({ where: { question_id: question.id } });
    await Difficulty.destroy({ where: { question_id: question.id } });

    // 정답 일괄 삭제
    const answers = await Answer.findAll({ where: { id: req.params.id }, raw: true });
    await Answer.destroy({ where: { question_id: question.id } });

    // 정답에 해당하는 댓글 및 평가 일괄 삭제
    for (let i = 0; answers.length; i++) {
      let answer = answers[i];
      const a_commentable_entity = await CommentableEntity.findOne({ where: { id: answer.commentable_entity_id } });
      await CommentableEntity.destroy({ where: { id: a_commentable_entity.id } });
      await Comment.destroy({ where: { commentable_entity_id: a_commentable_entity.id } });

      const a_likeable_entity = await LikeableEntity.findOne({ where: { id: answer.likeable_entity_id } });
      await LikeableEntity.destroy({ where: { id: a_commentable_entity.id } });
      await Like.destroy({ where: { likeable_entity_id: a_likeable_entity.id } });
    }

    // 모든 사용자로부터 해당 문제 즐겨찾기 삭제
    await Bookmark.destroy({ where: { question_id: question.id } });

    // 모든 사용자로부터 해당 시험 문제 삭제
    await TestQuestion.destroy({ where: { question_id: question.id } });

    return res.status(200).json({
      success: true,
      message: "문제 및 문제에 관련된 정보를 일괄 삭제하는 데 성공했습니다",
      result,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "해당 id를 가진 문제가 존재하지 않습니다",
    });
  }
});

module.exports = router;
