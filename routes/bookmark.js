const express = require("express");
const router = express.Router();
const { User, Question, Course, Bookmark } = require("../models");
const { isLoggedIn, getLoggedInUserId } = require("./middlewares");

// 해당 문제가 즐겨찾기된 적 있는지 확인한다
router.get("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user_id = await getLoggedInUserId(req, res); // 로그인한 사용자 ID
    const question_id = req.params.id; // 즐겨찾기 되어 있는지 확인할 문제 ID

    const question = await Question.findOne({ where: { id: question_id } });
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID를 가진 문제가 존재하지 않습니다",
      });
    }

    let is_bookmarked = (await Bookmark.findOne({ where: { user_id, question_id } })) ? true : false;

    return res.json({
      success: true,
      question: {
        id: question_id,
      },
      is_bookmarked,
      message: "해당 문제의 즐겨찾기 상태 확인에 성공했습니다",
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

// 페이지네이션을 이용해 로그인한 사용자가 가진 문제 즐겨찾기 리스트를 불러옴
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
      attributes: ["id", "created_at", "updated_at"],
      where: { user_id },
      include: [
        { model: User, attributes: ["username"] },
        {
          model: Question,
          attributes: ["id", "title", "type", "blocked", "createdAt"], // 제목까지만 조회
        },
      ],
      offset: +page - 1,
      limit: +per_page,
    };

    const bookmarks = await Bookmark.findAll(queryOptions);

    return res.json({
      success: true,
      message: "사용자가 등록한 문제 즐겨찾기 목록 조회에 성공했습니다",
      bookmarks,
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

// 문제 ID에 해당하는 문제를 즐겨찾기에 추가
router.post("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user_id = await getLoggedInUserId(req, res); // 사용자 ID
    const question_id = req.params.id; // 즐겨찾기에 추가할 문제 ID

    const question = await Question.findOne({ where: { id: question_id } });
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID를 가진 문제가 존재하지 않습니다",
      });
    }

    const existing_bookmark = await Bookmark.findOne({ where: { user_id, question_id } });
    if (existing_bookmark) {
      return res.status(400).json({
        success: false,
        error: "entryAlreadyExists",
        message: "해당 문제에 대한 즐겨찾기가 이미 존재합니다",
      });
    }

    const bookmark = await Bookmark.create({ question_id, user_id });

    return res.json({
      success: true,
      message: "문제가 성공적으로 즐겨찾기에 등록되었습니다",
      bookmark,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "문제를 즐겨찾기에 추가하는 데 실패했습니다",
    });
  }
});

// 문제 ID에 해당하는 즐겨찾기 완전 삭제
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user_id = await getLoggedInUserId(req, res); // 사용자 ID
    const question_id = req.params.id; // 즐겨찾기에서 삭제할 문제 ID

    const question = await Question.findOne({ where: { id: question_id } });
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 ID를 가진 문제가 존재하지 않습니다",
      });
    }

    const existing_bookmark = await Bookmark.findOne({ where: { user_id, question_id } });
    if (!existing_bookmark) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 문제가 즐겨찾기 되어있지 않습니다",
      });
    }

    // 문제 즐겨찾기 삭제
    await Bookmark.destroy({ where: { user_id, question_id } });

    return res.json({
      success: true,
      message: "해당 ID에 속하는 문제를 즐겨찾기에서 삭제하는 데 성공했습니다",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "문제를 즐겨찾기에서 삭제하는 데 실패했습니다",
    });
  }
});

module.exports = router;
