var express = require("express");
var router = express.Router();
const { Course } = require("../models");

// 모든 강의 리스트를 불러옴
router.get("/all", async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      attributes: ["id", "title", "subject_id"],
      order: [["id", "DESC"]],
    });

    if (courses.length == 0) {
      return res.json({
        success: false,
        msg: "등록된 강의가 없습니다.",
      });
    }
    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      msg: "DB 오류",
    });
  }
});

// 해당 강의 id에 해당하는 모든 문제를 불러옴
router.get("/:id", async (req, res, next) => {
  try {
    // 비활성화되지 않은 문제만 불러옴
    const questions = await Question.findAll({
      attributes: ["id", "content", "createdAt", "course_id", "user_id", "commentable_entity_id", "likeable_entity_id"],
      where: { blocked: false, course_id: req.params.id },
      order: [["id", "DESC"]],
    });

    if (questions.length == 0) {
      return res.json({
        success: false,
        msg: "해당 강의 id로 등록된 문제가 없습니다.",
      });
    }
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      msg: "DB 오류 또는 강의가 존재하지 않습니다.",
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
        msg: "해당 강의 이름으로 등록된 강의가 존재합니다.",
      });
    }
    const course = await Course.create({
      title,
      subject_id,
    });
    return res.status(200).json({
      success: true,
      msg: "강의가 성공적으로 등록되었습니다.",
      course,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      msg: "DB 오류",
    });
  }
});

module.exports = router;
