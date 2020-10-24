var express = require("express");
var router = express.Router();
const { User } = require("../models");
const { isLoggedIn, getLoggedInUserInfo } = require("./middlewares");

// 로그인한 사용자 정보 조회
router.get("/:username", isLoggedIn, async (req, res, next) => {
  const { username } = req.params; // 조회할 사용자 이름
  try {
    // 로그인한 사용자 정보
    let logged_in_user = await getLoggedInUserInfo(req, res);

    // 조회할 사용자 정보 조회
    let look_for_user = await User.findOne({
      where: { username: username },
      attributes: ["id", "username", "point", "active", "created_at"],
      raw: true,
    });

    // 조회할 사용자가 DB에 존재하지 않은 경우
    if (!look_for_user) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 닉네임을 가진 사용자가 존재하지 않습니다",
      });
    }

    // 로그인한 사용자 닉네임과 조회할 사용자 닉네임이 일치할 경우,
    // 본인 정보를 조회하는 것이라 간주
    if (logged_in_user.id == look_for_user.id) {
      delete logged_in_user.id;
      return res.json({
        success: true,
        message: "본 사용자 정보 조회에 성공했습니다",
        user: logged_in_user,
      });
    } else {
      // 그렇지 않은 경우에는 다른 사람의 정보를 조회
      delete look_for_user.id;
      return res.json({
        success: true,
        message: "사용자 정보 조회에 성공했습니다",
        user: look_for_user,
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

// 로그인한 사용자 정보를 수정
router.put("/:id", function (req, res, next) {
  res.send("update user: " + req.params.id);
});

module.exports = router;
