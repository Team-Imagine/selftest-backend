var express = require("express");
var router = express.Router();
const { Subject, Course } = require("../models");
const Op = require("sequelize").Op;
const sanitizeHtml = require("sanitize-html");

// 페이지네이션을 이용해 과목 리스트를 불러옴
router.get("/", async (req, res, next) => {
  try {
    // 쿼리 기본값
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 10;
    let q_subject_title = req.query.q_subject_title; // 검색할 과목 이름

    let queryOptions = {
      attributes: ["title"],
      where: {},
      order: [["title", "DESC"]],
      offset: +page - 1,
      limit: +per_page,
    };

    // 제목 검색어를 전달 받을 경우
    if (q_subject_title) {
      // 제목 검색 길이 제한
      if (q_subject_title.length < 2) {
        return res.status(400).json({
          success: false,
          error: "contentNotEnough",
          message: "검색어는 2자 이상이어야 합니다",
        });
      }
      queryOptions.where.title = {
        [Op.like]: "%" + q_subject_title + "%",
      };
    }

    const subjects = await Subject.findAll(queryOptions);

    return res.status(200).json({
      success: true,
      message: "등록된 과목 목록 조회에 성공했습니다",
      subjects,
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

// 해당 과목 이름에 해당하는 과목을 가져옴
router.get("/:title", async (req, res, next) => {
  try {
    const subject = await Subject.findAll({
      attributes: ["title"],
      where: { title: req.params.title },
      include: [{ model: Course, attributes: ["title"] }],
      order: [["title", "DESC"]],
    });

    if (!subject) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 과목 이름으로 등록된 과목이 존재하지 않습니다",
      });
    }
    return res.status(200).json({
      success: true,
      message: "등록된 과목 조회에 성공했습니다",
      subject,
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

// 새로운 과목을 등록
router.post("/", async (req, res, next) => {
  const { title } = req.body;
  try {
    // 동일한 과목 이름을 가진 강의가 있는지 확인
    const existingSubject = await Subject.findOne({ where: { title } });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 과목 이름으로 등록된 과목이 존재합니다",
      });
    }

    const subject = await Subject.create({
      title: sanitizeHtml(title),
    });

    return res.status(200).json({
      success: true,
      message: "과목이 성공적으로 등록되었습니다",
      subject: {
        title: title,
      },
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

module.exports = router;
