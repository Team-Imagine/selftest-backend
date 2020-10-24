const express = require("express");
const router = express.Router();
const { User, Question, Course, TestSet, TestQuestion } = require("../models");
const { isLoggedIn, getLoggedInUserId } = require("./middlewares");

// 페이지네이션을 이용해 로그인한 사용자가 가진 시험 리스트를 불러옴
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    // 쿼리 기본값
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 10;
    const user_id = await getLoggedInUserId(req, res); // 사용자 ID

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "userNotLoggedIn",
        message: "사용자가 로그인 되어있지 않습니다",
      });
    }

    let queryOptions = {
      attributes: ["id", "title", "created_at", "updated_at"],
      where: { user_id },
      include: [{ model: User, attributes: ["username"] }],
      offset: +page - 1,
      limit: +per_page,
    };

    const test_sets = await TestSet.findAll(queryOptions);

    return res.json({
      success: true,
      message: "등록된 시험 목록 조회에 성공했습니다",
      test_sets,
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

// 시험 ID에 해당하는 시험에 속하는 시험 문제 정보를 가져옴
router.get("/:id", isLoggedIn, async (req, res, next) => {
  try {
    // 쿼리 기본값
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 10;
    const { id } = req.params; // 시험 ID
    const user_id = await getLoggedInUserId(req, res); // 사용자 ID

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "userNotLoggedIn",
        message: "사용자가 로그인 되어있지 않습니다",
      });
    }

    const test_set = await TestSet.findOne({
      attributes: ["id", "title", "created_at", "updated_at"],
      where: { id, user_id },
      include: [
        { model: User, attributes: ["username"] },
        {
          model: TestQuestion,
          attributes: ["id"],
          include: [
            {
              model: Question,
              attributes: ["id", "content", "blocked", "createdAt"],
              where: { blocked: false },
              include: [
                { model: User, attributes: ["username"] },
                { model: Course, attributes: ["title"] },
              ],
            },
          ],
        },
      ],
      offset: +page - 1,
      limit: +per_page,
    });

    if (!test_set) {
      return res.json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID에 해당하는 시험이 존재하지 않습니다",
      });
    }

    return res.json({
      success: true,
      test_set,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      error: "entryNotExists",
      message: "해당 ID에 해당하는 시험이 존재하지 않습니다",
    });
  }
});

// 빈 시험을 하나 추가
router.post("/", isLoggedIn, async (req, res, next) => {
  const { title } = req.body;
  try {
    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "userNotLoggedIn",
        message: "사용자가 로그인 되어있지 않습니다",
      });
    }

    // 빈 시험 생성
    const test_set = await TestSet.create({ title, user_id });

    return res.json({
      success: true,
      message: "빈 시험을 성공적으로 생성하였습니다",
      test_set,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "빈 시험을 생성하는 데 실패했습니다",
    });
  }
});

// 문제 ID에 해당하는 문제를 시험 문제로서 시험에 추가
router.post("/question", isLoggedIn, async (req, res, next) => {
  const { test_set_id, question_id } = req.body; // 시험 ID와 문제 ID
  try {
    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "userNotLoggedIn",
        message: "사용자가 로그인 되어있지 않습니다",
      });
    }

    // 주어진 시험 ID에 해당하는 시험이 존재하는지 확인
    // 또한 로그인한 사용자 ID가 일치해야함
    const test_set = await TestSet.findOne({ where: { id: test_set_id, user_id: user_id }, raw: true });
    if (!test_set) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 시험 ID에 해당하는 시험이 존재하지 않습니다",
      });
    }

    // 주어진 문제 ID에 해당하는 문제가 존재하는지 확인
    const question = await Question.findOne({ where: { id: question_id }, raw: true });
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 문제 ID에 해당하는 문제가 존재하지 않습니다",
      });
    }

    // 시험 문제 생성
    const test_question = await TestQuestion.create({
      test_set_id: test_set.id,
      question_id: question.id,
    });

    return res.json({
      success: true,
      message: "문제가 성공적으로 시험에 등록되었습니다",
      test_question,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "문제를 시험에 추가하는 데 실패했습니다",
    });
  }
});

// 시험 ID에 해당하는 시험 완전 삭제
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  // 시험 ID
  const { id } = req.params;

  try {
    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "userNotLoggedIn",
        message: "사용자가 로그인 되어있지 않습니다",
      });
    }

    // 시험 조회
    const test_set = await TestSet.findOne({ where: { id, user_id }, raw: true });

    if (!test_set) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 시험 ID에 해당하는 시험이 존재하지 않습니다",
      });
    }

    // 시험 삭제
    const result = await TestSet.destroy({ where: { id: test_set.id } });

    // 해당 시험에 속하는 시험 문제 일괄 삭제
    await TestQuestion.destroy({ where: { test_set_id: test_set.id } });

    return res.json({
      success: true,
      message: "시험 및 해당 시험에 속하는 문제를 일괄 삭제하는 데 성공했습니다",
      test_set: { id: test_set.id },
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "entryNotExists",
      message: "해당 ID를 가진 시험이 존재하지 않습니다",
    });
  }
});

// 시험 문제 ID에 해당하는 시험 문제 완전 삭제
router.delete("/question/:id", isLoggedIn, async (req, res, next) => {
  // 시험 문제 ID
  const { id } = req.params;

  try {
    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "userNotLoggedIn",
        message: "사용자가 로그인 되어있지 않습니다",
      });
    }

    // 시험 조회
    const test_question = await TestQuestion.findOne({
      attributes: ["id", "test_set_id"],
      include: [
        { model: TestSet },
        {
          model: Question,
          attributes: ["id", "content", "blocked", "createdAt"],
          where: { blocked: false },
          include: [
            { model: User, attributes: ["username"] },
            { model: Course, attributes: ["title"] },
          ],
        },
      ],
      where: { id },
      raw: true,
    });

    // 해당 시험 문제가 로그인한 사용자가 갖고 있는 시험의 일부인지 확인
    const test_set = await TestSet.findOne({
      where: { id: test_question.test_set_id },
      raw: true,
    });

    // 로그인한 사용자의 시험에 속한 시험 문제가 아닐 경우 삭제 거부
    // 해당 ID의 시험 문제가 존재하지 않을 경우 삭제 실패
    // 보안을 위해 두 메세지 통일
    if (test_set.user_id != user_id || !test_question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID를 가진 시험 문제가 존재하지 않습니다",
      });
    }

    // 문제 삭제
    const result = await TestQuestion.destroy({ where: { id: test_question.id } });

    return res.json({
      success: true,
      message: "해당 시험 문제를 삭제하는 데 성공했습니다",
      test_question: { id: test_question.id },
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "entryNotExists",
      message: "해당 ID를 가진 시험 문제가 존재하지 않습니다",
    });
  }
});

module.exports = router;