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
const Op = require("sequelize").Op;
const { isLoggedIn, getLoggedInUserId } = require("./middlewares");
const { getSortOptions } = require("./bin/get_sort_options");
const sanitizeHtml = require("sanitize-html");

// 정렬이 가능한 컬럼 정의
const sortableColumns = ["id", "content", "blocked", "created_at"];

// 페이지네이션을 이용해 문제 리스트를 불러옴
router.get("/", async (req, res, next) => {
  try {
    // 쿼리 기본값
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 10;
    let course_title = req.query.course_title; // 강의 제목
    let q_question_content = req.query.q_question_content; // 문제 내용 검색어
    let sort = req.query.sort; // 정렬 옵션

    // 정렬 옵션 설정
    let sortOptions = getSortOptions(sort);

    if (!sortableColumns.includes(sortOptions.column)) {
      return res.status(400).json({
        success: false,
        error: "requestFails",
        message: "정렬에 필요한 컬럼 이름이 잘못됐습니다",
      });
    }

    if (sortOptions.order !== "asc" && sortOptions.order !== "desc") {
      return res.status(400).json({
        success: false,
        error: "requestFails",
        message: "정렬에 필요한 정렬 순서명이 잘못됐습니다",
      });
    }

    let queryOptions = {
      attributes: ["id", "content", "blocked", "createdAt"],
      where: {},
      include: [
        { model: User, attributes: ["username"] },
        { model: Course, attributes: ["title"] },
      ],
      order: [[sortOptions.column, sortOptions.order]],
      offset: +page - 1,
      limit: +per_page,
    };

    // 강의 이름을 전달받았다면 강의 이름으로 검색
    if (course_title) {
      const course = await Course.findOne({
        attributes: ["id", "title"],
        where: { title: course_title },
      });

      if (!course) {
        return res.status(400).json({
          success: false,
          error: "entryNotExists",
          message: "해당 강의 이름으로 등록된 강의가 존재하지 않습니다",
        });
      }
      queryOptions.where.course_id = course.id;
    }

    // 문제 내용 검색어를 전달 받았을 경우
    if (q_question_content) {
      // 문제 검색 키워드 길이 제한
      if (q_question_content.length < 2) {
        return res.status(400).json({
          success: false,
          error: "contentNotEnough",
          message: "검색어는 2자 이상이어야 합니다",
        });
      }
      // TODO: HTML 태그 제거 후 검색
      queryOptions.where.content = {
        [Op.like]: "%" + q_question_content + "%",
      };
    }

    // 비활성화되지 않은 문제만 불러옴
    // TODO: 좋아요, 신선해요, 난이도, 댓글 수 등 추가
    const questions = await Question.findAll(queryOptions);

    return res.json({
      success: true,
      message: "등록된 문제 목록 조회에 성공했습니다",
      questions,
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

// 문제 ID에 따른 문제 정보를 가져옴
router.get("/:id", async (req, res, next) => {
  try {
    // TODO: 좋아요, 신선해요, 난이도, 댓글 수 등 추가
    const question = await Question.findOne({
      attributes: ["id", "content", "blocked", "createdAt"],
      where: {
        id: req.params.id,
      },
      include: [
        { model: User, attributes: ["username"] },
        { model: Course, attributes: ["title"] },
        { model: CommentableEntity, attributes: ["id", "entity_type"] },
        { model: LikeableEntity, attributes: ["id", "entity_type"] },
      ],
    });

    if (!question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID에 해당하는 문제가 존재하지 않습니다",
      });
    }

    return res.json({
      success: true,
      message: "등록된 문제 조회에 성공했습니다",
      question,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "entryNotExists",
      message: "해당 ID에 해당하는 문제가 존재하지 않습니다",
    });
  }
});

// 강의 이름과 문제 내용을 바탕으로 문제 생성
router.post("/", isLoggedIn, async (req, res, next) => {
  let { content } = req.body;
  const { course_title } = req.body;
  try {
    // 동일하거나 유사한 문제가 있는 경우
    // TODO: 동일하거나 유사한 문제 존재시 중복문제 또는 복수정답 처리
    // ...

    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 주어진 강의 이름에 해당하는 강의가 존재하는지 확인
    const course = await Course.findOne({ where: { title: course_title } });
    if (!course) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 과목 이름에 해당하는 과목이 존재하지 않습니다",
      });
    }

    // 문제 내용에서 스크립트 제거 (XSS 방지)
    content = sanitizeHtml(content);

    // TODO: 생성할 문제 내용이 충분한지 확인
    if (!content) {
      return res.status(400).json({
        success: false,
        error: "contentNotEnough",
        message: "생성할 문제 내용이 부족합니다",
      });
    }

    // 문제 생성
    const question = await Question.create({
      content,
      course_id: course.id,
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
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "문제를 등록하는 데 실패했습니다",
    });
  }
});

// 문제 ID에 해당하는 문제 내용을 수정
router.put("/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  let { content } = req.body;
  try {
    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 접속한 사용자의 ID와 query에 있는 문제의 user_id룰 를 대조
    const question = await Question.findOne({ where: { id: id } });
    if (question.user_id !== user_id) {
      return res.status(401).json({
        success: false,
        error: "userMismatches",
        message: "자신이 업로드한 문제만 내용을 수정할 수 있습니다",
      });
    }

    // 문제 내용에서 스크립트 제거 (XSS 방지)
    content = sanitizeHtml(content);

    // TODO: 수정할 문제 내용이 존재하는지 확인
    if (!content) {
      return res.status(400).json({
        success: false,
        error: "contentNotEnough",
        message: "수정할 문제 내용이 부족합니다",
      });
    }

    await Question.update({ content }, { where: { id } });
    return res.json({
      success: true,
      message: "문제 내용을 성공적으로 갱신했습니다",
      question: { id: question.id },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "entryNotExists",
      message: "해당 ID를 가진 문제가 존재하지 않습니다",
    });
  }
});

// 문제 ID에 해당하는 문제 완전 삭제
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  // 문제 ID
  const { id } = req.params;

  try {
    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 접속한 사용자의 ID와 query에 있는 문제의 user_id룰 대조
    const question = await Question.findOne({ where: { id: id }, raw: true });
    if (question.user_id !== user_id) {
      return res.status(401).json({
        success: false,
        error: "userMismatches",
        message: "자신이 업로드한 문제만 삭제할 수 있습니다",
      });
    }

    // 문제 삭제
    const result = await Question.destroy({ where: { id: id } });

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

    return res.json({
      success: true,
      message: "문제 및 문제에 관련된 정보를 일괄 삭제하는 데 성공했습니다",
      question: { id: id },
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "entryNotExists",
      message: "해당 ID를 가진 문제가 존재하지 않습니다",
    });
  }
});

module.exports = router;
