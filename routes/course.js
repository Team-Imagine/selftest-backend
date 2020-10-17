var express = require("express");
var router = express.Router();
const { Subject, Course } = require("../models");

// 페이지네이션을 이용해 강의 리스트를 불러옴
router.get("/", async (req, res, next) => {
  try {
    // 쿼리 기본값
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 10;

    const courses = await Course.findAll({
      attributes: ["title"],
      include: [{ model: Subject, attributes: ["title"] }],
      order: [["title", "DESC"]],
      offset: +page - 1,
      limit: +per_page,
    });

    if (courses.length == 0) {
      return res.json({
        success: false,
        message: "등록된 강의가 없습니다",
      });
    }
    return res.status(200).json({
      success: true,
      message: "등록된 강의 목록 조회에 성공했습니다",
      courses,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
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
      return res.json({
        success: false,
        message: "해당 강의가 존재하지 않습니다",
      });
    }
    return res.status(200).json({
      success: true,
      message: "등록된 강의 조회에 성공했습니다",
      course,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "요청 오류",
    });
  }
});

// 새로운 강의를 등록
router.post("/", async (req, res, next) => {
  const { title, subject_id } = req.body;
  try {
    // 동일한 강의 이름을 가진 강의가 있는지 확인
    const existingCourse = await Course.findOne({ where: { title } });
    if (existingCourse) {
      return res.json({
        success: false,
        message: "해당 강의 이름으로 등록된 강의가 존재합니다",
      });
    }
    const course = await Course.create({
      title,
      subject_id,
    });
    return res.status(200).json({
      success: true,
      message: "강의가 성공적으로 등록되었습니다",
      course,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "DB 오류",
    });
  }
});

module.exports = router;
