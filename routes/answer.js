var express = require("express");
var router = express.Router();
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const { isLoggedIn, getLoggedInUserId } = require("./middlewares");
const { get_likes, get_dislikes } = require("./bin/manipulators/evaluations");
const { getSortOptions } = require("./bin/get_sort_options");
const { convertUploadedImageUrls } = require("./bin/convert_uploaded_image_urls");
const {
  User,
  Question,
  Answer,
  LikeableEntity,
  Like,
  MultipleChoiceItem,
  ShortAnswerItem,
  Dislike,
} = require("../models");

// 정렬이 가능한 컬럼 정의
const sortableColumns = ["id", "content", "blocked", "created_at"];

// 문제 ID에 따른 정답/풀이 정보를 가져옴
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    // 쿼리 기본값
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 10;
    let question_id = req.query.question_id; // 문제 ID
    let q_answer_content = req.query.q_answer_content; // 정답 내용 검색어
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
        { model: Question, attributes: ["id", "type"] },
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

    // 문제 ID를 전달받았다면 문제 ID로 찾기
    if (question_id) {
      const question = await Question.findOne({
        attributes: ["id"],
        where: { id: question_id },
      });

      if (!question) {
        return res.status(400).json({
          success: false,
          error: "entryNotExists",
          message: "해당 요청에 맞는 등록된 정답이 존재하지 않습니다",
        });
      }
      queryOptions.where.question_id = question.id;
    }

    // 정답 내용 검색어를 전달 받았을 경우
    if (q_answer_content) {
      // 정답 검색 키워드 길이 제한
      if (q_answer_content.length < 2) {
        return res.status(400).json({
          success: false,
          error: "contentNotEnough",
          message: "검색어는 2자 이상이어야 합니다",
        });
      }
      // TODO: HTML 태그 제거 후 검색
      queryOptions.where.content = {
        [Op.like]: "%" + q_answer_content + "%",
      };
    }

    // 정답 목록 조회
    const answers = await Answer.findAndCountAll(queryOptions);

    // Get likes and dislikes
    for (let i = 0; i < answers.rows.length; i++) {
      const likeable_entity_id = answers.rows[i]["likeable_entity.id"];
      answers.rows[i]["likeable_entity.total_likes"] = (await get_likes(likeable_entity_id)).total_likes;
      answers.rows[i]["likeable_entity.total_dislikes"] = (await get_dislikes(likeable_entity_id)).total_dislikes;
    }

    for (let j = 0; j < answers.rows.length; j++) {
      // 객관식일 경우, 보기 추가
      if (answers.rows[j]["question.type"] === "multiple_choice") {
        items = await MultipleChoiceItem.findAll({
          where: { question_id: answers.rows[j].id, checked: true },
          raw: true,
        });
        answers.rows[j].multiple_choice_answers = items;
      } else if (answers.rows[j]["question.type"] === "short_answer") {
        // 주관식일 경우, 정답 예시를 추가
        items = await ShortAnswerItem.findAll({
          where: { question_id: answers.rows[j].id },
          raw: true,
        });
        answers.rows[j].short_answer_answers = items;
      }
    }

    return res.json({
      success: true,
      message: "해당 문제 ID로 등록된 정답 목록 조회에 성공했습니다",
      answers,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "entryNotExists",
      message: "해당 문제 ID에 해당하는 정답이 존재하지 않습니다",
    });
  }
});

// 정답 ID에 따른 정답 정보를 가져옴 (객관식 제외)
router.get("/:id", isLoggedIn, async (req, res, next) => {
  try {
    let answer = await Answer.findOne({
      attributes: ["id", "content", "blocked", "createdAt"],
      where: {
        id: req.params.id,
      },
      include: [
        { model: User, attributes: ["username"] },
        { model: Question, attributes: ["id", "type"] },
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
      ],
    });

    if (!answer) {
      return res.json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID에 해당하는 정답이 존재하지 않습니다",
      });
    }

    return res.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      error: "entryNotExists",
      message: "해당 ID에 해당하는 정답이 존재하지 않습니다",
    });
  }
});

// 문제 ID와 정답 내용을 바탕으로 정답 생성
router.post("/", isLoggedIn, async (req, res, next) => {
  let { content, uploaded_images } = req.body;
  const { question_id } = req.body;
  try {
    // 동일하거나 유사한 정답이 있는 경우
    // TODO: 동일하거나 유사한 정답 존재시 중복정답 처리
    // ...

    // 접속한 사용자의 id를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 주어진 문제 ID에 해당하는 문제가 존재하는지 확인
    const question = await Question.findOne({ where: { id: question_id } });
    if (!question) {
      return res.json({
        success: false,
        error: "entryNotExists",
        message: "해당 문제 ID에 해당하는 문제가 존재하지 않습니다",
      });
    }

    // TODO: 생성할 정답 내용이 충분한지 확인
    if (!content) {
      return res.status(400).json({
        success: false,
        error: "contentNotEnough",
        message: "생성할 정답 내용이 부족합니다",
      });
    }

    // blob URL에서 업로드한 이미지 URL로 대체
    if (uploaded_images && uploaded_images.length > 0) {
      content = convertUploadedImageUrls(content, uploaded_images);
    }

    // 정답 생성
    const answer = await Answer.create({
      content,
      question_id: question.id,
      user_id,
    });

    // 생성한 정답에 좋아요 entity id 연결
    const likeable_entity = await LikeableEntity.create({
      entity_type: "answer",
    });
    await Answer.update({ likeable_entity_id: likeable_entity.id }, { where: { id: answer.id } });

    return res.json({
      success: true,
      message: "정답이 성공적으로 등록되었습니다",
      answer: { id: answer.id },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "정답을 등록하는 데 실패했습니다",
    });
  }
});

// 정답 ID에 해당하는 정답 내용을 수정
router.put("/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  let { content, uploaded_images } = req.body;

  try {
    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 접속한 사용자의 ID와 query에 있는 정답의 user_id룰 를 대조
    const answer = await Answer.findOne({ where: { id: id } });
    if (answer.user_id !== user_id) {
      return res.status(401).json({
        success: false,
        error: "userMismatches",
        message: "자신이 업로드한 정답만 내용을 수정할 수 있습니다",
      });
    }

    // TODO: 수정할 정답 내용이 존재하는지 확인
    if (!content) {
      return res.status(400).json({
        success: false,
        error: "contentNotEnough",
        message: "수정할 문제 내용이 부족합니다",
      });
    }

    // blob URL에서 업로드한 이미지 URL로 대체
    if (uploaded_images && uploaded_images.length > 0) {
      content = convertUploadedImageUrls(content, uploaded_images);
    }

    await Answer.update({ content }, { where: { id } });
    return res.json({
      success: true,
      message: "정답 내용을 성공적으로 갱신했습니다",
      answer: { id: answer.id },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "entryNotExists",
      message: "해당 ID를 가진 정답이 존재하지 않습니다",
    });
  }
});

// 정답 ID에 해당하는 정답 완전 삭제
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  // 정답 ID
  const { id } = req.params;

  try {
    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);
    console.log(user_id);

    // 접속한 사용자의 ID와 query에 있는 정답의 user_id룰 대조
    const answer = await Answer.findOne({ where: { id: id }, raw: true });
    if (answer.user_id !== user_id) {
      return res.status(401).json({
        success: false,
        error: "userMismatches",
        message: "자신이 업로드한 정답만 삭제할 수 있습니다",
      });
    }

    // 정답 삭제
    const result = await Answer.destroy({ where: { id: id } });

    // 정답에 달린 평가 일괄 삭제 (좋아요)
    const q_likeable_entity = await LikeableEntity.findOne({ where: { id: answer.likeable_entity_id } });
    await LikeableEntity.destroy({ where: { id: q_likeable_entity.id } });
    await Like.destroy({ where: { likeable_entity_id: q_likeable_entity.id } });
    await Dislike.destroy({ where: { likeable_entity_id: q_likeable_entity.id } });

    return res.json({
      success: true,
      message: "정답 및 정답에 관련된 정보를 일괄 삭제하는 데 성공했습니다",
      answer: { id: id },
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "entryNotExists",
      message: "해당 ID를 가진 정답이 존재하지 않습니다",
    });
  }
});

module.exports = router;
