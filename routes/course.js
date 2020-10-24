var express = require("express");
var router = express.Router();
const { Subject, Course } = require("../models");
const Op = require("sequelize").Op;
const sanitizeHtml = require("sanitize-html");

// 페이지네이션을 이용해 강의 리스트를 불러옴
router.get("/", async (req, res, next) => {
  try {
    // 쿼리 기본값
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 10;
    let subject_title = req.query.subject_title; // 과목 이름
    let q_course_title = req.query.q_course_title; // 검색할 강의 이름

    let queryOptions = {
      attributes: ["title"],
      include: [{ model: Subject, attributes: ["title"] }],
      where: {},
      order: [["title", "DESC"]],
      offset: +page - 1,
      limit: +per_page,
    };

    // 제목 검색어를 전달 받을 경우
    if (q_course_title) {
      // 제목 검색 길이 제한
      if (q_course_title.length < 2) {
        return res.status(400).json({
          success: false,
          error: "contentNotEnough",
          message: "검색어는 2자 이상이어야 합니다",
        });
      }
      queryOptions.where.title = {
        [Op.like]: "%" + q_course_title + "%",
      };
    }

    // 과목 이름을 전달받았다면 과목 이름으로 검색
    if (subject_title) {
      const subject = await Subject.findOne({
        attributes: ["id", "title"],
        where: { title: subject_title },
      });

      if (!subject) {
        return res.status(400).json({
          success: false,
          error: "entryNotExists",
          message: "해당 과목 이름으로 등록된 과목이 존재하지 않습니다.",
        });
      }
      queryOptions.where.subject_id = subject.id;
    }

    const courses = await Course.findAll(queryOptions);

    return res.status(200).json({
      success: true,
      message: "등록된 강의 목록 조회에 성공했습니다",
      courses,
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

// 해당 강의 이름에 해당하는 강의를 불러옴
router.get("/:title", async (req, res, next) => {
  try {
    const course = await Course.findOne({
      attributes: ["title"],
      where: { title: req.params.title },
      include: [{ model: Subject, attributes: ["title"] }],
      order: [["title", "DESC"]],
    });

    if (!course) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 강의 이름으로 등록된 강의가 존재하지 않습니다",
      });
    }
    return res.status(200).json({
      success: true,
      message: "등록된 강의 조회에 성공했습니다",
      course,
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

// 새로운 강의를 등록
router.post("/", async (req, res, next) => {
  const { title, subject_title } = req.body;
  try {
    // 동일한 강의 이름을 가진 강의가 있는지 확인
    const existingCourse = await Course.findOne({ where: { title } });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: "entryAlreadyExists",
        message: "해당 강의 이름으로 등록된 강의가 존재합니다",
      });
    }

    const subject = await Subject.findOne({ where: { title: subject_title } });
    if (!subject) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 과목 이름으로 등록된 과목이 존재하지 않습니다",
      });
    }

    const course = await Course.create({
      title: sanitizedHtml(title),
      subject_id: subject.id,
    });
    return res.status(200).json({
      success: true,
      message: "강의가 성공적으로 등록되었습니다",
      course: {
        title: course.title,
        subject: {
          title: subject_title,
        },
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
