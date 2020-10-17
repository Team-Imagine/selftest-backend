var express = require("express");
var router = express.Router();
const { Subject, Course } = require("../models");

// 페이지네이션을 이용해 과목 리스트를 불러옴
router.get("/", async (req, res, next) => {
  try {
    // 쿼리 기본값
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 10;

    const subjects = await Subject.findAll({
      attributes: ["title"],
      order: [["title", "DESC"]],
      offset: +page - 1,
      limit: +per_page,
    });

    if (subjects.length == 0) {
      return res.json({
        success: false,
        message: "등록된 과목이 없습니다",
      });
    }
    return res.status(200).json({
      success: true,
      message: "등록된 과목 목록 조회에 성공했습니다",
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
      return res.json({
        success: false,
        message: "해당 과목이 존재하지 않습니다",
      });
    }
    return res.status(200).json({
      success: true,
      message: "등록된 과목 조회에 성공했습니다",
      subject,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "DB 오류 또는 과목이 존재하지 않습니다",
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
        message: "해당 과목 이름으로 등록된 과목이 존재합니다",
      });
    }
    const subject = await Subject.create({
      title,
    });
    return res.status(200).json({
      success: true,
      message: "과목이 성공적으로 등록되었습니다",
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
