const express = require("express");
const router = express.Router();
const { isLoggedIn, getLoggedInUserId } = require("./middlewares");
const {
  User,
  Question,
  MultipleChoiceItem,
  ShortAnswerItem,
  Answer,
  Course,
  TestSet,
  TestQuestion,
} = require("../models");

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
      offset: (+page - 1) * per_page,
      limit: +per_page,
    };

    const test_sets = await TestSet.findAndCountAll(queryOptions);

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

    const test_set = await TestSet.findAndCountAll({
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
              attributes: ["id", "title", "type", "content", "blocked", "createdAt"],
              where: { blocked: false },
              include: [
                { model: User, attributes: ["username"] },
                { model: Course, attributes: ["title"] },
              ],
            },
          ],
        },
      ],
      offset: (+page - 1) * per_page,
      limit: +per_page,
    });

    if (!test_set) {
      return res.json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID에 해당하는 시험이 존재하지 않습니다",
      });
    }

    for (let row of test_set.rows[0].test_questions) {
      let question_id = row.question.id;
      let question_type = row.question.type;

      if (question_type === "multiple_choice") {
        // 객관식일 경우, 보기 추가
        let items = await MultipleChoiceItem.findAll({
          where: { question_id },
        });
        row.question.dataValues.multiple_choice_items = items;
      } else if (question_type === "short_answer") {
        // 주관식일 경우, 정답 예시를 추가
        let items = await ShortAnswerItem.findAll({
          where: { question_id },
        });
        row.question.dataValues.short_answer_items = items;
      }
    }

    return res.json({
      success: true,
      message: "해당 ID에 해당하는 시험에 대한 시험 문제 목록 조회에 성공했습니다",
      test_set,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "entryNotExists",
      message: "해당 ID에 해당하는 시험이 존재하지 않습니다",
    });
  }
});

// 시험 ID에 해당하는 시험에 속하는 시험 문제 정답 정보를 가져옴
router.get("/:id/answers", isLoggedIn, async (req, res, next) => {
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

    let test_set = await TestSet.findOne({ where: { id, user_id } });

    if (!test_set) {
      return res.json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID에 해당하는 시험이 존재하지 않습니다",
      });
    }

    const test_questions = await TestQuestion.findAndCountAll({
      attributes: ["id", "question_id"],
      where: { test_set_id: test_set.id },
      include: [
        {
          model: Question,
          attributes: ["id", "type"],
          where: { blocked: false },
          include: [
            { model: User, attributes: ["username"] },
            { model: Course, attributes: ["title"] },
          ],
        },
      ],
      offset: (+page - 1) * per_page,
      limit: +per_page,
    });

    for (let row of test_questions.rows) {
      let question_id = row.question.id;
      const answers = await Answer.findAll({
        where: { question_id },
        order: [["created_at", "ASC"]],
        offset: 0,
        limit: 1,
      });
      row.question.dataValues.answers = answers;
    }

    for (let row of test_questions.rows) {
      let question_id = row.question.id;
      let question_type = row.question.type;

      if (question_type === "multiple_choice") {
        // 객관식일 경우, 보기 추가
        let items = await MultipleChoiceItem.findAll({
          where: { question_id, checked: true },
        });
        row.question.dataValues.multiple_choice_answers = items;
      } else if (question_type === "short_answer") {
        // 주관식일 경우, 정답 예시를 추가
        let items = await ShortAnswerItem.findAll({
          where: { question_id },
        });
        row.question.dataValues.short_answer_answers = items;
      }
    }

    test_set.dataValues.test_questions = test_questions;

    return res.json({
      success: true,
      message: "해당 ID에 해당하는 시험에 대한 시험 문제의 정답 목록 조회에 성공했습니다",
      test_set,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "entryNotExists",
      message: "해당 ID에 해당하는 시험이 존재하지 않습니다",
    });
  }
});

// 문제 ID에 해당하는 문제들을 시험에 추가
router.post("/question", isLoggedIn, async (req, res, next) => {
  const { test_set_id, questions } = req.body; // 시험 ID와 문제 ID로 구성된 문제 배열

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

  let test_questions = []; // 시험 문제 배열
  let existing_questions = []; // 이미 해당 시험에 존재하는 문제라 추가 실패한 문제 배열
  let not_existing_questions = []; // 존재하지 않는 문제들
  let invalid_questions = []; // 추가에 실패한 문제들

  for (const question of questions) {
    // 문제가 애초에 존재하는지 확인
    const existing_question = await Question.findOne({
      where: { id: question.id },
    });

    if (!existing_question) {
      not_existing_questions.push({ question_id: question.id });
      continue;
    }

    // 해당 시험에 해당 문제가 이미 존재하는지 확인
    const existing_test_question = await TestQuestion.findOne({
      where: { test_set_id: test_set.id, question_id: question.id },
    });

    if (existing_test_question) {
      existing_questions.push({ test_set_id: test_set.id, question_id: existing_test_question.question_id });
      continue;
    }

    try {
      // 시험 문제 생성
      const test_question = await TestQuestion.create({
        test_set_id: test_set.id,
        question_id: question.id,
      });

      // 시험 문제 배열에 추가
      test_questions.push(test_question);
    } catch (error) {
      // 시험 문제 추가 실패
      invalid_questions.push({ question_id: question.id });
    }
  }

  return res.json({
    success: true,
    message: "문제 목록이 시험에 등록되었습니다",
    test_questions,
    existing_questions,
    not_existing_questions,
    invalid_questions,
  });
});

// 문제 ID에 해당하는 문제들을 시험에서 삭제하고 다시 추가
router.put("/question", isLoggedIn, async (req, res, next) => {
  const { test_set_id, questions } = req.body; // 시험 ID와 문제 ID로 구성된 문제 배열

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

  // 기존 문제 일괄 삭제
  await TestQuestion.delete({ where: { test_set_id: test_set.id } });

  let test_questions = []; // 시험 문제 배열
  let not_existing_questions = []; // 존재하지 않는 문제들
  let invalid_questions = []; // 추가에 실패한 문제들

  for (const question of questions) {
    // 문제가 애초에 존재하는지 확인
    const existing_question = await Question.findOne({
      where: { id: question.id },
    });

    if (!existing_question) {
      not_existing_questions.push({ question_id: question.id });
      continue;
    }

    try {
      // 시험 문제 생성
      const test_question = await TestQuestion.create({
        test_set_id: test_set.id,
        question_id: question.id,
      });
    } catch (error) {
      // 시험 문제 추가 실패
      invalid_questions.push({ question_id: question.id });
    }

    // 시험 문제 배열에 추가
    test_questions.push(test_question);
  }

  return res.json({
    success: true,
    message: "시험 문제 목록이 수정되었습니다",
    test_questions,
    not_existing_questions,
    invalid_questions,
  });
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

    // 사용자가 이미 해당 제목을 가진 시험을 가지고 있을 경우
    const existing_test_set = await TestSet.findOne({ where: { title, user_id } });
    if (existing_test_set) {
      return res.status(400).json({
        success: false,
        error: "entryExists",
        message: "해당 제목을 가진 시험을 이미 보유하고 있습니다",
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

// // 과목 이름에 해당하는 문제를 시험으로 생성
// router.post("/course/:course_title", isLoggedIn, async (req, res, next) => {
//   try {
//     const course_title = req.params.course_title; // 과목 이름
//     const { title, num_questions } = req.body;

//     // 접속한 사용자의 ID를 받아옴
//     const user_id = await getLoggedInUserId(req, res);

//     if (!user_id) {
//       return res.status(401).json({
//         success: false,
//         error: "userNotLoggedIn",
//         message: "사용자가 로그인 되어있지 않습니다",
//       });
//     }

//     const course = await Course.findOne({
//       // attributes: ["id", "title"],
//       where: { title: course_title },
//       // include: [{ model: Subject, attributes: ["title"] }],
//     });

//     if (!course) {
//       return res.status(400).json({
//         success: false,
//         error: "entryNotExists",
//         message: "해당 강의 이름으로 등록된 강의가 존재하지 않습니다",
//       });
//     }

//     // 사용자가 이미 해당 제목을 가진 시험을 가지고 있을 경우
//     const existing_test_set = await TestSet.findOne({ where: { title, user_id } });
//     if (existing_test_set) {
//       return res.status(400).json({
//         success: false,
//         error: "entryExists",
//         message: "해당 제목을 가진 시험을 이미 보유하고 있습니다",
//       });
//     }

//     // 빈 시험 생성
//     // const test_set = await TestSet.create({ title, user_id });

//     // 해당 과목에 있는 문제 개수를 최대값으로 설정
//     const num_existing_questions = await Question.count({ where: { course_id: course.id } });
//     console.log(num_existing_questions, num_questions);
//     const max_questions = Math.min(num_existing_questions, num_questions);

//     // TODO: 평가에 따른 문제 선별
//     // 현재 랜덤 문제 선별
//     const questions = await Question.findAll({
//       where: { course_id: course.id, blocked: false },
//       attributes: [
//         "id",
//         "title",
//         "likeable_entity_id",
//         [Sequelize.fn("AVG", Sequelize.col("difficulties.score")), "average_difficulty"],
//         [Sequelize.fn("AVG", Sequelize.col("freshnesses.fresh")), "average_freshness"],
//       ],
//       include: [
//         {
//           model: LikeableEntity,
//           attributes: [
//             "id",
//             [Sequelize.fn("COUNT", Sequelize.col("good")), "total_likes"],
//             [Sequelize.fn("COUNT", Sequelize.col("bad")), "total_dislikes"],
//           ],
//           include: [
//             { model: Like, attributes: [], duplicating: false },
//             { model: Dislike, attributes: [], duplicating: false },
//           ],
//           distinct: true,
//           group: ["LikeableEntity.id"],
//           duplicating: false,
//         },
//         { model: Difficulty, attributes: [], duplicating: false },
//         { model: Freshness, attributes: [], duplicating: false },
//         { model: Course, attributes: ["title"] },
//       ],
//       group: ["Question.id"],
//       limit: max_questions,
//       distinct: true,
//       // order: [["difficulties", "asc"]],
//     });

//     return res.json({
//       success: true,
//       // message: "문제 목록이 시험에 등록되었습니다",
//       // test_questions,
//       questions,
//       max_questions,
//       num_questions,
//       num_existing_questions,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json({
//       success: false,
//       error: "requestFails",
//       message: "빈 시험을 생성하는 데 실패했습니다",
//     });
//   }
// });

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
