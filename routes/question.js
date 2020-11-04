const express = require("express");
const router = express.Router();
const {
  User,
  Question,
  QuestionViewLog,
  MultipleChoiceItem,
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
  ShortAnswerItem,
} = require("../models");
const Op = require("sequelize").Op;
const { isLoggedIn, getLoggedInUserId } = require("./middlewares");
const { getSortOptions } = require("./bin/get_sort_options");
const sanitizeHtml = require("sanitize-html");

// 정렬이 가능한 컬럼 정의
const sortableColumns = ["id", "title", "type", "content", "blocked", "created_at"];

// 페이지네이션을 이용해 문제 리스트를 불러옴
router.get("/", async (req, res, next) => {
  try {
    // 쿼리 기본값
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 10;
    let course_title = req.query.course_title; // 강의 제목
    let question_type = req.query.question_type; // 문제 유형
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
      attributes: ["id", "title", "type", "blocked", "createdAt"], // 제목까지만 조회
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

    // 문제 유형을 전달받았다면 문제 유형으로 검색
    if (question_type) {
      if (question_type !== "multiple_choice" && question_type !== "short_answer" && question_type !== "essay") {
        return res.status(400).json({
          success: false,
          error: "questionTypeInvalid",
          message: "문제 유형이 올바르지 않습니다",
        });
      }

      queryOptions.where.type = question_type;
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
router.get("/:id", isLoggedIn, async (req, res, next) => {
  try {
    // TODO: 좋아요, 신선해요, 난이도, 댓글 수 등 추가
    const question = await Question.findOne({
      attributes: ["id", "title", "type", "content", "blocked", "createdAt"],
      where: {
        id: req.params.id,
      },
      include: [
        { model: User, attributes: ["username"] },
        { model: Course, attributes: ["title"] },
        { model: CommentableEntity, attributes: ["id", "entity_type"] },
        { model: LikeableEntity, attributes: ["id", "entity_type"] },
      ],
      raw: true,
    });

    if (!question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID에 해당하는 문제가 존재하지 않습니다",
      });
    }

    // 객관식일 경우, 보기를 불러옴
    if (question.type === "multiple_choice") {
      question.multiple_choice_items = await MultipleChoiceItem.findAll({ where: { question_id: question.id } });
    }

    // 주관식일 경우, 정답 예시를 불러옴
    if (question.type === "short_answer") {
      question.short_answer_items = await ShortAnswerItem.findAll({ where: { question_id: question.id } });
    }

    // 조회에 성공하면 해당 사용자가 조회를 한 것으로 간주
    const user_id = await getLoggedInUserId(req, res); // 로그인한 사용자 ID
    const view_log = await QuestionViewLog.findOne({ where: { question_id: question.id, user_id: user_id } }); // 여태 해당 문제를 조회한 적 있는지 여부

    // 조회한 적이 없다면 문제 조회를 기록하고 포인트 차감
    if (!view_log) {
      // 사용자의 포인트가 충분한지 확인
      const user = await User.findOne({ where: { id: user_id } });

      // 포인트가 부족한 경우, 요청 거부
      if (user.point < 1) {
        return res.status(400).json({
          success: false,
          error: "notEnoughPoint",
          message: "문제를 조회하기 위한 포인트가 부족합니다",
        });
      }

      // 충분한 경우, 사용자 1포인트 차감
      await user.decrement("point", { by: 1 });

      // 조회 기록
      await QuestionViewLog.create({
        question_id: question.id,
        user_id,
      });

      return res.json({
        success: true,
        message: "등록된 문제 조회에 성공했습니다",
        point_decrement: 1,
        question,
      });
    }

    return res.json({
      success: true,
      message: "등록된 문제 조회에 성공했습니다",
      point_decrement: 0,
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
  let { title, type, content, multiple_choice_items, short_answer_items } = req.body; // 제목, 유형, 내용, 객관식 문제 보기 또는 주관식 문제 정답 예시
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
    title = sanitizeHtml(title);
    type = sanitizeHtml(type);
    content = sanitizeHtml(content);

    // 생성할 문제 제목이 존재하는지 확인
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "contentNotEnough",
        message: "생성할 문제 제목이 부족합니다",
      });
    }

    // 생성할 문제 유형이 올바르지 않는 경우
    if (!type || (type && type !== "multiple_choice" && type !== "short_answer" && type !== "essay")) {
      console.log(type);
      return res.status(400).json({
        success: false,
        error: "questionTypeInvalid",
        message: "문제 유형이 올바르지 않습니다",
      });
    }

    // TODO: 생성할 문제 내용이 충분한지 확인
    if (!content) {
      return res.status(400).json({
        success: false,
        error: "contentNotEnough",
        message: "생성할 문제 내용이 부족합니다",
      });
    }

    // 문제 유형이 객관식인 경우
    if (type === "multiple_choice") {
      // 보기가 없으면 오류
      if (!multiple_choice_items || (multiple_choice_items && multiple_choice_items.length < 1)) {
        return res.status(400).json({
          success: false,
          error: "multipleChoiceItemsNotGiven",
          message: "객관식 문제의 보기가 부족합니다",
        });
      }
    }

    // 문제 유형이 주관식인 경우
    if (type === "short_answer") {
      // 정답이 없으면 오류
      if (!short_answer_items || (short_answer_items && short_answer_items.length < 1)) {
        return res.status(400).json({
          success: false,
          error: "shortAnswerItemsNotGiven",
          message: "주관식 문제의 정답 예시가 부족합니다",
        });
      }
    }

    // 문제 생성
    let question = await Question.create({
      title,
      type,
      content,
      course_id: course.id,
      user_id,
    });

    // 문제 유형이 객관식인 경우
    if (type === "multiple_choice") {
      // 각 보기마다 보기 및 정답 레코드 생성
      for (const multiple_choice_item of multiple_choice_items) {
        // 보기 생성
        let item = await MultipleChoiceItem.create({
          question_id: question.id,
          item_text: multiple_choice_item.item_text,
          checked: multiple_choice_item.checked,
        });
      }
    }

    // 문제 유형이 주관식인 경우
    if (type === "short_answer") {
      // 정답 예시 생성
      for (const short_answer_item of short_answer_items) {
        let item = await ShortAnswerItem.create({
          question_id: question.id,
          item_text: sanitizeHtml(short_answer_item.item_text),
        });
      }
    }

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

    // 본인이 올린 문제는 조회에 포인트가 차감이 되면 안되므로 조회 기록
    await QuestionViewLog.create({
      question_id: question.id,
      user_id,
    });

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
  let { title, content } = req.body;
  try {
    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 접속한 사용자의 ID와 query에 있는 문제의 user_id룰 를 대조
    const question = await Question.findOne({ where: { id: id } });
    if (question.user_id !== user_id) {
      return res.status(401).json({
        success: false,
        error: "userMismatches",
        message: "자신이 업로드한 문제만 정보를 수정할 수 있습니다",
      });
    }

    // 문제 내용 및 제목에서 스크립트 제거 (XSS 방지)
    title = sanitizeHtml(title);
    content = sanitizeHtml(content);

    // 수정할 문제 제목이 존재하는지 확인
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "contentNotEnough",
        message: "수정할 문제 제목이 부족합니다",
      });
    }

    // TODO: 수정할 문제 내용이 존재하는지 확인
    if (!content) {
      return res.status(400).json({
        success: false,
        error: "contentNotEnough",
        message: "수정할 문제 내용이 부족합니다",
      });
    }

    await Question.update({ title, content }, { where: { id } });
    return res.json({
      success: true,
      message: "문제 정보를 성공적으로 갱신했습니다",
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

    // (객관식 문제) 해당 문제의 보기 전부 삭제
    await MultipleChoiceItem.destroy({ where: { question_id: question.id } });

    // (주관식 문제) 해당 문제의 정답 예시 전부 삭제
    await ShortAnswerItem.destroy({ where: { question_id: question.id } });

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
