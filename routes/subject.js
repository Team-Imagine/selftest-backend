var express = require("express");
var router = express.Router();
const { Subject, Course } = require("../models");

// 모든 과목 리스트를 불러옴
router.get("/all", async (req, res, next) => {
  try {
    const subjects = await Subject.findAll({
      attributes: ["id", "title"],
      order: [["title", "DESC"]],
    });

    if (subjects.length == 0) {
      return res.json({
        success: false,
        message: "등록된 과목이 없습니다.",
      });
    }
    res.status(200).json({
      success: true,
      message: "등록된 과목 목록 조회에 성공했습니다.",
      subjects,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "DB 오류",
    });
  }
});

// 해당 과목 id에 해당하는 모든 강의를 불러옴
router.get("/:id", async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      attributes: ["id", "title", "subject_id"],
      where: { subject_id: req.params.id },
      order: [["title", "DESC"]],
    });

    if (courses.length == 0) {
      return res.json({
        success: false,
        message: "해당 과목 id로 등록된 강의가 없습니다.",
      });
    }
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "DB 오류 또는 과목이 존재하지 않습니다.",
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
      return res.json({
        success: false,
        message: "해당 과목 이름으로 등록된 과목이 존재합니다.",
      });
    }
    const subject = await Subject.create({
      title,
    });
    return res.status(200).json({
      success: true,
      message: "과목이 성공적으로 등록되었습니다.",
      subject,
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
