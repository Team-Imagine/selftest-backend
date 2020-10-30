var express = require("express");
var router = express.Router();
const { User } = require("../models");
const { isLoggedIn, getLoggedInUserId } = require("./middlewares");

// 사용자 정보 조회
router.get("/:username", isLoggedIn, async (req, res, next) => {
  const { username } = req.params; // 조회할 사용자 이름
  try {
    // 조회할 사용자 정보 조회
    const user = await User.findOne({
      where: { username: username },
      attributes: ["username", "point", "active", "created_at"],
      raw: true,
    });

    // 조회할 사용자가 DB에 존재하지 않은 경우
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 닉네임을 가진 사용자가 존재하지 않습니다",
      });
    }

    return res.json({
      success: true,
      message: "사용자 정보 조회에 성공했습니다",
      user,
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

// 로그인한 사용자 정보 조회
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    // 로그인한 사용자 ID
    const user_id = await getLoggedInUserId(req, res);

    // 조회할 사용자 정보 조회
    const user = await User.findOne({
      where: { id: user_id },
      attributes: ["id", "username", "point", "active", "created_at"],
      raw: true,
    });

    return res.json({
      success: true,
      message: "로그인한 사용자 정보 조회에 성공했습니다",
      user,
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

// 로그인한 사용자 정보를 수정
router.put("/:id", function (req, res, next) {
  res.send("update user: " + req.params.id);
});

module.exports = router;
