const express = require("express");
const router = express.Router();
const moment = require("moment");
const { Attendance } = require("../models");
const { Op } = require("sequelize");
const { getLoggedInUserId, isLoggedIn } = require("./middlewares");

// 페이지네이션을 이용해 로그인한 사용자가 여태까지 출석한 날짜를 구함
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    // 쿼리 기본값
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 10;

    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    let queryOptions = {
      attributes: ["createdAt"], // 제목까지만 조회
      where: { user_id },
      order: [["createdAt", "desc"]],
      offset: (+page - 1) * per_page,
      limit: +per_page,
    };

    const attendances = await Attendance.findAndCountAll(queryOptions);

    return res.json({
      success: true,
      message: "사용자 출석 목록 조회에 성공했습니다",
      attendances,
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

// 로그인한 사용자가 하루 이내 출석했는지 여부를 구함
router.get("/today", isLoggedIn, async (req, res, next) => {
  try {
    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 하루 이내 출석 정보를 가져옴
    const existingAttendances = await Attendance.findAll({
      attributes: ["createdAt"], // 제목까지만 조회
      order: [["createdAt", "desc"]],
      where: {
        user_id,
        createdAt: {
          [Op.gte]: moment().subtract(1, "days").toDate(),
        },
      },
    });

    return res.json({
      success: true,
      message: "사용자 출석 정보 조회에 성공했습니다",
      attendances: existingAttendances,
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

// 로그인한 사용자를 출석 처리
router.post("/", isLoggedIn, async (req, res, next) => {
  try {
    // 접속한 사용자의 ID를 받아옴
    const user_id = await getLoggedInUserId(req, res);

    // 하루 이내 출석한 적 있는지 정보를 가져옴
    const existingAttendances = await Attendance.findAll({
      where: {
        user_id,
        createdAt: {
          [Op.gte]: moment().subtract(1, "days").toDate(),
        },
      },
    });

    if (existingAttendances.length < 1) {
      await Attendance.create({
        user_id,
      });

      return res.json({
        success: true,
        message: "로그인한 사용자의 출석 처리에 성공했습니다",
      });
    } else {
      return res.json({
        success: true,
        message: "로그인한 사용자는 이미 출석한 상태입니다",
        attendances: existingAttendances,
      });
    }
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
