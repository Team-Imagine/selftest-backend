// ================================= question.js =================================
// // 페이지네이션을 이용해 소장한 문제 리스트를 불러옴
// router.get("/owned", isLoggedIn, async (req, res, next) => {
//   try {
//     // 쿼리 기본값
//     let page = req.query.page || 1;
//     let per_page = req.query.per_page || 10;
//     let course_title = req.query.course_title; // 강의 제목
//     let sort = req.query.sort; // 정렬 옵션

//     // 정렬 옵션 설정
//     let sortOptions = getSortOptions(sort);

//     if (!sortableColumns.includes(sortOptions.column)) {
//       return res.status(400).json({
//         success: false,
//         error: "requestFails",
//         message: "정렬에 필요한 컬럼 이름이 잘못됐습니다",
//       });
//     }

//     if (sortOptions.order !== "asc" && sortOptions.order !== "desc") {
//       return res.status(400).json({
//         success: false,
//         error: "requestFails",
//         message: "정렬에 필요한 정렬 순서명이 잘못됐습니다",
//       });
//     }

//     let user_id = getLoggedInUserId(req, res); // debug

//     let queryOptions = {
//       attributes: [
//         "id",
//         "title",
//         "type",
//         "blocked",
//         "createdAt",
//         [sequelize.fn("COUNT", sequelize.col("question_solved_logs.id")), "num_solved_times"],
//         [sequelize.fn("COUNT", sequelize.col("unlocked_questions.id")), "is_unlocked"],
//       ], // 제목까지만 조회
//       include: [
//         { model: User, attributes: ["username"] },
//         { model: Course, attributes: ["title"], include: [{ model: Subject, attributes: ["title"] }] },
//         { model: CommentableEntity, attributes: ["id", "entity_type"] },
//         { model: LikeableEntity, attributes: ["id", "entity_type"] },
//         { model: QuestionSolvedLog, attributes: ["user_id", "createdAt"], duplicating: true },
//         { model: UnlockedQuestion, attributes: ["user_id", "createdAt"], duplicating: true },
//         // { model: QuestionSolvedLog, attributes: ["user_id"], duplicating: false, where: { user_id } },
//         // { model: UnlockedQuestion, attributes: ["user_id"], duplicating: false, where: { user_id } },
//       ],
//       // 블라인드 처리되지 않은 문제만 카운트
//       // where: { blocked: false },
//       group: ["Question.id"],
//       // 소장한 문제 = 풀어본 횟수가 1 이상이고 열람 처리된 문제
//       having: {
//         [sequelize.Op.and]: [
//           // sequelize.where(sequelize.fn("COUNT", sequelize.col("question_solved_logs.id")), ">=", 1),
//           // sequelize.where(sequelize.fn("COUNT", sequelize.col("unlocked_questions.id")), ">=", 1),
//           // sequelize.where(sequelize.fn("COUNT", sequelize.col("question_solved_logs.user_id")), ">=", 1),
//           // sequelize.where(sequelize.col("unlocked_questions.user_id"), user_id),
//         ],
//       },
//       order: [[sortOptions.column, sortOptions.order]],
//       offset: (+page - 1) * per_page,
//       limit: +per_page,
//       distinct: true,
//       // raw: true,
//     };

//     // 비활성화되지 않은 문제만 불러옴
//     // TODO: 좋아요, 신선해요, 난이도, 댓글 수 등 추가
//     const questions = await Question.findAll(queryOptions);
//     // questions.count = questions.count.length;

//     // // Get likes, dislikes, and average difficulty and freshness
//     // for (let i = 0; i < questions.rows.length; i++) {
//     //   const likeable_entity_id = questions.rows[i]["likeable_entity.id"];
//     //   questions.rows[i]["likeable_entity.total_likes"] = (await get_likes(likeable_entity_id)).total_likes;
//     //   questions.rows[i]["likeable_entity.total_dislikes"] = (await get_dislikes(likeable_entity_id)).total_dislikes;
//     //   questions.rows[i]["average_difficulty"] = (await get_average_difficulty(questions.rows[i].id)).average_difficulty;
//     //   questions.rows[i]["average_freshness"] = (await get_average_freshness(questions.rows[i].id)).average_freshness;
//     // }

//     return res.json({
//       success: true,
//       message: "등록된 문제 목록 조회에 성공했습니다",
//       questions,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json({
//       success: false,
//       error: "requestFails",
//       message: "요청 오류",
//     });
//   }
// });
// ==============================================================================