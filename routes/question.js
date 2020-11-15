const { PythonShell } = require("python-shell");
var textsimilarity = require('textsimilarity');
const similarity = require('similarity');

const path = require("path");

var mod = require('korean-text-analytics');
var task = new mod.TaskQueue();


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
  Dislike,
  Difficulty,
  Freshness,
  Bookmark,
  TestQuestion,
  Course,
  ShortAnswerItem,
  QuestionSolvedLog,
} = require("../models");
const Op = require("sequelize").Op;
const sequelize = require("sequelize");
const { isLoggedIn, getLoggedInUserId } = require("./middlewares");
const { getSortOptions } = require("./bin/get_sort_options");
const { get_likes, get_dislikes, get_average_difficulty, get_average_freshness } = require("./bin/get_evaluations");
const sanitizeHtml = require("sanitize-html");
const UnlockedQuestion = require("../models/test/unlocked_question");

// 정렬이 가능한 컬럼 정의
const sortableColumns = ["id", "title", "type", "content", "blocked", "created_at"];

// 문제에 들어가는 포인트 정의
const POINTS_TO_DECREASE_TO_SOLVE_QUESTION = 1; // 문제를 풀이 처리 하는데 들어가는 포인트
const POINTS_TO_DECREASE_TO_UNLOCK_ANSWERS = 2; // 문제 정답 풀이를 열람하는데 들어가는 포인트

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
        { model: CommentableEntity, attributes: ["id", "entity_type"] },
        {
          model: LikeableEntity,
          attributes: ["id", "entity_type"],
        },
      ],
      order: [[sortOptions.column, sortOptions.order]],
      offset: (+page - 1) * per_page,
      limit: +per_page,
      raw: true,
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
    const questions = await Question.findAndCountAll(queryOptions);

    // Get likes, dislikes, and average difficulty and freshness
    for (let i = 0; i < questions.length; i++) {
      const likeable_entity_id = questions[i]["likeable_entity.id"];
      questions[i]["likeable_entity.total_likes"] = (await get_likes(likeable_entity_id)).total_likes || 0;
      questions[i]["likeable_entity.total_dislikes"] = (await get_dislikes(likeable_entity_id)).total_dislikes || 0;
      questions[i]["average_difficulty"] = (await get_average_difficulty(questions[i].id).average_difficulty) || 0;
      questions[i]["average_freshness"] = (await get_average_freshness(questions[i].id).average_freshness) || 0;
    }

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
        {
          model: LikeableEntity,
          attributes: ["id", "entity_type"],
          include: [
            {
              model: Like,
              attributes: [[sequelize.fn("COUNT", sequelize.col("good")), "total_likes"]],
            },
            {
              model: Dislike,
              attributes: [[sequelize.fn("COUNT", sequelize.col("bad")), "total_dislikes"]],
            },
          ],
        },
        {
          model: Difficulty,
          attributes: ["id", [sequelize.fn("AVG", sequelize.col("score")), "average_difficulty"]],
        },
        {
          model: Freshness,
          attributes: ["id", [sequelize.fn("AVG", sequelize.col("fresh")), "average_freshness"]],
        },
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

    const user_id = await getLoggedInUserId(req, res); // 로그인한 사용자 ID

    // 문제를 풀이한 적 있거나, 열람한 적 있거나, 소장하고 있는지 여부의 정보를 추가
    const solve_log = await QuestionSolvedLog.findAll({
      where: { question_id: question.id, user_id: user_id },
      raw: true,
    }); // 여태 해당 문제를 풀이한 적 있는지 여부
    const unlocked = await UnlockedQuestion.findOne({ where: { question_id: question.id, user_id: user_id } }); // 여태 해당 문제를 열람한 적 있는지 조회

    question.solved = solve_log ? solve_log.length : 0; // 채점 횟수
    question.unlocked = unlocked ? true : false; // 열람 여부
    question.owned = question.solved > 0 && question.unlocked ? true : false; //소장 여부

    // 조회에 성공하면 해당 사용자가 조회를 한 것으로 간주
    const view_log = await QuestionViewLog.findOne({ where: { question_id: question.id, user_id: user_id } }); // 여태 해당 문제를 조회한 적 있는지 여부

    // 조회한 적이 없다면 문제 조회를 기록
    if (!view_log) {
      // 조회 기록
      await QuestionViewLog.create({
        question_id: question.id,
        user_id,
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

    // 문제 제목에서 스크립트 제거 (XSS 방지)
    title = sanitizeHtml(title);
    type = sanitizeHtml(type);

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
          item_text: sanitizeHtml(multiple_choice_item.item_text),
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

    // 본인이 올린 문제는 조회/풀이/정답 열람에 포인트가 차감이 되면 안되므로,
    // 1. 조회에 포인트가 차감이 되면 안되므로 조회 기록
    await QuestionViewLog.create({
      question_id: question.id,
      user_id,
    });

    // 2. 문제 풀이 기록에 추가하여 문제를 풀이 처리
    await QuestionSolvedLog.create({ user_id, question_id });

    // 3. 문제를 열람한 문제 목록에 추가하여 문제를 열람 처리
    await UnlockedQuestion.create({ user_id, question_id });

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
  let { title, content, multiple_choice_items, short_answer_items } = req.body;
  try {
    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 접속한 사용자의 ID와 query에 있는 문제의 user_id룰 를 대조
    const question = await Question.findOne({ where: { id: id }, raw: true });
    if (question.user_id !== user_id) {
      return res.status(401).json({
        success: false,
        error: "userMismatches",
        message: "자신이 업로드한 문제만 정보를 수정할 수 있습니다",
      });
    }

    // 문제 제목에서 스크립트 제거 (XSS 방지)
    title = sanitizeHtml(title);

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

    if (question.type === "multiple_choice" && multiple_choice_items && multiple_choice_items.length > 0) {
      // 객관식 문제일 경우, 보기 수정 지원
      for (const multiple_choice_item of multiple_choice_items) {
        await MultipleChoiceItem.update(
          { item_text: sanitizeHtml(multiple_choice_item.item_text), checked: multiple_choice_item.checked },
          { where: { id: multiple_choice_item.id, question_id: question.id } }
        );
      }
    } else if (question.type === "short_answer" && short_answer_items && short_answer_items.length > 0) {
      // 주관식 문제일 경우, 정답 예시 수정 지원
      for (const short_answer_item of short_answer_items) {
        await ShortAnswerItem.update(
          { item_text: sanitizeHtml(short_answer_item.item_text) },
          { where: { id: short_answer_item.id, question_id: question.id } }
        );
      }
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
    await Dislike.destroy({ where: { likeable_entity_id: q_likeable_entity.id } });
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
      await Dislike.destroy({ where: { likeable_entity_id: a_likeable_entity.id } });
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

// 문제 ID에 해당하는 문제를 풀이 처리
// TODO: 일정 기간/분기 지나면 (e.g., 한 달) 다시 풀이처리 할 수 있도록 하기
router.get("/solve/:id", isLoggedIn, async (req, res, next) => {
  const question_id = req.params.id; // 문제 풀이처리할 문제 ID
  try {
    // 풀이 처리할 문제
    const question = await Question.findOne({ where: { id: question_id } });
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 문제 ID를 가진 문제가 존재하지 않습니다",
      });
    }

    // 문제를 푼 적이 있는지 조회
    const user_id = await getLoggedInUserId(req, res); // 로그인한 사용자 ID
    const solve_log = await QuestionSolvedLog.findOne({ where: { question_id: question.id, user_id: user_id } }); // 여태 해당 문제를 풀이한 적 있는지 여부

    let points_used = 0; // 실제로 차감된 포인트

    // 문제를 한 번도 푼 적이 없다면 포인트 차감
    if (!solve_log) {
      // 사용자의 포인트가 충분한지 확인
      const user = await User.findOne({ where: { id: user_id } });

      // 포인트가 부족한 경우, 요청 거부
      if (user.point < POINTS_TO_DECREASE_TO_SOLVE_QUESTION) {
        return res.status(400).json({
          success: false,
          error: "notEnoughPoint",
          message: "문제를 풀이 처리하기 위한 포인트가 부족합니다",
        });
      }

      // 충분한 경우, 사용자 포인트 차감
      await user.decrement("point", { by: POINTS_TO_DECREASE_TO_SOLVE_QUESTION });
      points_used += POINTS_TO_DECREASE_TO_SOLVE_QUESTION;
    }

    // 문제 풀이 기록에 추가하여 문제를 풀이 처리
    await QuestionSolvedLog.create({ user_id, question_id });

    return res.json({
      success: true,
      message: "등록된 문제 풀이 처리에 성공했습니다",
      point_decrement: points_used,
      question: {
        id: question_id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "문제를 풀이 처리 하는데 실패했습니다",
    });
  }
});

// 문제 ID에 해당하는 문제의 정답 풀이의 열람 권한 추가
router.get("/unlock/:id", isLoggedIn, async (req, res, next) => {
  const question_id = req.params.id; // 열람할 문제 ID
  try {
    // 풀이 열람할 문제
    const question = await Question.findOne({ where: { id: question_id } });
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 문제 ID를 가진 문제가 존재하지 않습니다",
      });
    }

    // 문제를 열람한 적이 있는지 조회
    const user_id = await getLoggedInUserId(req, res); // 로그인한 사용자 ID
    const unlocked = await UnlockedQuestion.findOne({ where: { question_id: question.id, user_id: user_id } }); // 여태 해당 문제를 열람한 적 있는지 조회

    if (!unlocked) {
      // 문제 정답 풀이를 한 번도 열람한 적이 없다면 포인트 차감
      // 사용자의 포인트가 충분한지 확인
      const user = await User.findOne({ where: { id: user_id } });

      // 포인트가 부족한 경우, 요청 거부
      if (user.point < POINTS_TO_DECREASE_TO_UNLOCK_ANSWERS) {
        return res.status(400).json({
          success: false,
          error: "notEnoughPoint",
          message: "문제 정답 풀이를 열람하기 위한 포인트가 부족합니다",
        });
      }

      // 충분한 경우, 사용자 포인트 차감
      await user.decrement("point", { by: POINTS_TO_DECREASE_TO_UNLOCK_ANSWERS });

      // 문제를 열람한 문제 목록에 추가하여 문제를 열람 처리
      await UnlockedQuestion.create({ user_id, question_id });

      return res.json({
        success: true,
        message: "등록된 문제의 정답 풀이 열람 처리에 성공했습니다",
        point_decrement: POINTS_TO_DECREASE_TO_SOLVE_QUESTION,
        question: {
          id: question_id,
        },
      });
    } else {
      // 문제 정답 풀이를 한 번이라도 열람한 적이 있다면, 더 이상 열람할 필요가 없음
      return res.json({
        success: true,
        message: "문제 정답 풀이가 이미 열람되어 있습니다",
        point_decrement: 0,
        question: {
          id: question_id,
        },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "문제를 풀이 처리 하는데 실패했습니다",
    });
  }
});

// 문제 ID에 해당하는 문제를 소장
router.get("/own/:id", isLoggedIn, async (req, res, next) => {
  const question_id = req.params.id; // 소장할 문제 ID
  try {
    // 풀이 열람할 문제
    const question = await Question.findOne({ where: { id: question_id } });
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 문제 ID를 가진 문제가 존재하지 않습니다",
      });
    }

    // 문제를 열람한 적이 있는지 조회
    const user_id = await getLoggedInUserId(req, res); // 로그인한 사용자 ID
    const solve_log = await QuestionSolvedLog.findOne({ where: { question_id: question.id, user_id: user_id } }); // 여태 해당 문제를 풀이한 적 있는지 여부
    const unlocked = await UnlockedQuestion.findOne({ where: { question_id: question.id, user_id: user_id } }); // 여태 해당 문제를 열람한 적 있는지 조회

    let points_used = 0; // 소장하는데 들어간 포인트 = 풀이 차감 포인트 + 열람 차감 포인트

    // 포인트 차감을 위해 사용자 정보를 가져옴
    const user = await User.findOne({ where: { id: user_id } });

    // 문제를 한 번도 푼 적이 없다면 포인트 차감
    if (!solve_log) {
      points_used += POINTS_TO_DECREASE_TO_SOLVE_QUESTION;

      // 문제 풀이 기록에 추가하여 문제를 풀이 처리
      await QuestionSolvedLog.create({ user_id, question_id });
    }

    // 문제 정답 풀이를 한 번도 열람한 적이 없다면 포인트 차감
    if (!unlocked) {
      points_used += POINTS_TO_DECREASE_TO_UNLOCK_ANSWERS;

      // 문제를 열람한 문제 목록에 추가하여 문제를 열람 처리
      await UnlockedQuestion.create({ user_id, question_id });
    }

    // 포인트가 부족한 경우, 요청 거부
    if (user.point < points_used) {
      return res.status(400).json({
        success: false,
        error: "notEnoughPoint",
        message: "문제를 소장하기 위한 포인트가 부족합니다",
      });
    }

    // 충분한 경우, 사용자 포인트 차감
    await user.decrement("point", { by: points_used });

    return res.json({
      success: true,
      message: "등록된 문제를 성공적으로 소장했습니다",
      point_decrement: points_used,
      question: {
        id: question_id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "문제를 풀이 처리 하는데 실패했습니다",
    });
  }
});

/*
const titleGet = (title) => {
  let titleList = [];

  mod.ExecuteMorphModule(title, async(err, rep) => {   
    for(var i in rep.morphed) {
      if(rep.morphed[i].tag === 'NNG' || rep.morphed[i].tag === 'VV' || rep.morphed[i].tag === 'NNP') {
        titleList.push(rep.morphed[i].word);
      }
    }

    console.log(titleList);
    return titleList;
  })
}
*/

const pushList = async (questions) => {   
  let doclist = [];
  for(var i in questions) {
    doclist.push(questions[i].dataValues.title);
  }
  return doclist;
}

const compareTitle = async(selected, doclist) => {
  await mod.ExecuteMorphModule(selected.title, async(err, rep) => {   
    let arr = '';
    for(var i in rep.morphed) {
      if(rep.morphed[i].tag === 'NNG' || rep.morphed[i].tag === 'NNP') {
        arr += rep.morphed[i].word + ' ';
      }
    }
    selected.title = arr;
    console.log(selected.title);

    for(var j in doclist) {
      await mod.ExecuteMorphModule(doclist[j], async(err, rep) => {
        
        let arr = '';
        for(var k in rep.morphed) {
          if(rep.morphed[k].tag === 'NNG' || rep.morphed[k].tag === 'NNP') {
            arr += rep.morphed[k].word + ' ';
          }
        }

        console.log(selected.title, ',', arr, '와의 유사도:', similarity(selected.title, arr));

        if(similarity(selected.title, arr) > 0.5 && similarity(selected.title, arr) !== 1) {
          console.log(selected.title, ',', arr, similarity(selected.title, arr));
          //console.log(questions[i].dataValues.title, questions[i].dataValues.id,',' , selected.id ," 유사합니다." );
        }
      })
    }
  })

}

router.post("/test", async (req, res, next) => {
  const { selected_id } = req.body;

  const question = await Question.findOne({
    attributes: ["id", "title", "type", "content", "blocked", "createdAt"],
    where: {
      id: selected_id,
    },
  });
  
  let queryOptions = {
    attributes: ["id", "title", "type", "content", "createdAt"], // 제목까지만 조회
    where: {},
  };

  const questions = await Question.findAll(queryOptions);

  let doclist = await pushList(questions);

  console.log(doclist);
 
  compareTitle(question.dataValues, doclist);

  //console.log(doclist);

  //console.log(textsimilarity(doclist[8], doclist[9]));

  /*
  var options = {
    mode: 'text',
    encoding: 'utf8',
    pythonOptions: ['-u'],
    scriptPath: 'routes',
    args: [JSON.stringify({ questions })],
    pythonPath: ''
  };

  PythonShell.run("example.py", options, function(err, data) {
    res.status(200).json({ data: JSON.parse(data), success: true });

    data = JSON.parse(data);

    //console.log(data.id);
  });
  */    
});

module.exports = router;
