const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { isJustLoggedIn, getLoggedInUserId, getLoggedInUserInfo } = require("./middlewares");
const { sendPasswordResetEmail } = require("./bin/send_email");
const { User, PasswordResetRequest, PointLog, PenaltyLog } = require("../models");

// 사용자 정보 조회
router.get("/:username", isJustLoggedIn, async (req, res, next) => {
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

// 사용자 포인트 내역 조회
router.get("/:username/point-logs", isJustLoggedIn, async (req, res, next) => {
  try {
    const { username } = req.params; // 조회할 사용자 이름
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 10;

    // 조회할 사용자 정보 조회
    const requested_user = await User.findOne({
      where: { username: username },
      attributes: ["id", "username", "point", "active", "created_at"],
      raw: true,
    });

    // 조회할 사용자가 DB에 존재하지 않은 경우
    if (!requested_user) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 닉네임을 가진 사용자가 존재하지 않습니다",
      });
    }

    const logged_in_user = await getLoggedInUserInfo(req, res);
    if (logged_in_user.id != requested_user.id) {
      return res.status(400).json({
        success: false,
        error: "userMismatches",
        message: "자신의 포인트 내역만 조회할 수 있습니다",
      });
    }

    const point_logs = await PointLog.findAndCountAll({
      attributes: ["content", "amount", "created_at"],
      where: { user_id: logged_in_user.id },
      order: [["created_at", "DESC"]],
      offset: (+page - 1) * per_page,
      limit: +per_page,
    });

    return res.json({
      success: true,
      message: "사용자 포인트 내역 조회에 성공했습니다",
      point_logs,
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

// 사용자 제재 내역 조회
router.get("/:username/penalty-logs", isJustLoggedIn, async (req, res, next) => {
  try {
    const { username } = req.params; // 조회할 사용자 이름
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 10;

    // 조회할 사용자 정보 조회
    const requested_user = await User.findOne({
      where: { username: username },
      attributes: ["id", "username", "point", "active", "created_at"],
      raw: true,
    });

    // 조회할 사용자가 DB에 존재하지 않은 경우
    if (!requested_user) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 닉네임을 가진 사용자가 존재하지 않습니다",
      });
    }

    const logged_in_user = await getLoggedInUserInfo(req, res);
    if (logged_in_user.id != requested_user.id) {
      return res.status(400).json({
        success: false,
        error: "userMismatches",
        message: "자신의 제재 내역만 조회할 수 있습니다",
      });
    }

    const penalty_logs = await PenaltyLog.findAndCountAll({
      attributes: ["content", "termination_date", "created_at"],
      where: { user_id: logged_in_user.id },
      order: [
        ["created_at", "DESC"],
        ["termination_date", "DESC"],
      ],
      offset: (+page - 1) * per_page,
      limit: +per_page,
    });

    return res.json({
      success: true,
      message: "사용자 제재 내역 조회에 성공했습니다",
      penalty_logs,
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
router.get("/", isJustLoggedIn, async (req, res, next) => {
  try {
    // 로그인한 사용자 ID
    const user_id = await getLoggedInUserId(req, res);

    // 조회할 사용자 정보 조회
    const user = await User.findOne({
      where: { id: user_id },
      attributes: ["id", "username","email","point", "active", "verified", "created_at"],
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

// 사용자 비밀번호 초기화 인증 코드 이메일 전송 요청 (성공 여부 상관없이 이메일을 보냈다고 함)
router.post("/forgot-password", async (req, res, next) => {
  let { email } = req.body;

  try {
    // 조회할 사용자 정보 조회
    const user = await User.findOne({ where: { email } });

    if (user) {
      sendPasswordResetEmail(user.email);
    }

    return res.json({
      success: true,
      message: "사용자 비밀번호 초기화 이메일을 보내는 데 성공했습니다",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "사용자 비밀번호 초기화에 실패했습니다",
    });
  }
});

// 인증 코드가 일치할시 새로운 비밀번호로 변경
router.post("/verify-change-password", async (req, res, next) => {
  const { code, new_password } = req.body; // 가입 인증 코드

  try {
    console.log(code);
    // 인증코드 대조
    const verification_code_in_db = await PasswordResetRequest.findOne({
      where: { code },
      raw: true,
    });

    // 생성 시간으로부터 인증 만료 시간이 지났는지 확인
    let expiration_time = new Date(verification_code_in_db.createdAt);
    const DURATION_IN_MINUTES = 3; // 인증 만료 시간 3분
    expiration_time.setMinutes(expiration_time.getMinutes() + DURATION_IN_MINUTES);

    // 현재 시간과 비교
    if (expiration_time < new Date()) {
      // 만료시간 지난 인증 코드 삭제
      await PasswordResetRequest.destroy({
        where: { id: verification_code_in_db.id },
      });

      return res.status(400).json({
        success: false,
        error: "verificationCodeExpires",
        message: "인증 만료 시간이 지났습니다. 코드를 다시 발급받으세요",
      });
    }

    if (verification_code_in_db) {
      // 비밀번호 길이가 충분한지 확인
      if (new_password.length < 8) {
        return res.status(400).json({
          success: false,
          error: "contentNotEnough",
          message: "새로운 비밀번호의 길이가 충분하지 않습니다 (8 이상)",
        });
      }

      // 인증 코드 삭제
      await PasswordResetRequest.destroy({
        where: { id: verification_code_in_db.id },
      });

      // 일치할 경우
      const hash = await bcrypt.hash(new_password, 12);
      await User.update({ password: hash }, { where: { id: verification_code_in_db.user_id } });

      return res.json({
        success: true,
        message: "인증 코드가 일치합니다. 비밀번호 변경에 성공했습니다",
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "verificationCodeMismatches",
        message: "인증 코드 인증에 실패했습니다. 인증 코드를 다시 확인해주세요",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "사용자 비밀번호 초기화에 실패했습니다",
    });
  }
});

// 로그인한 사용자 정보를 일부 변경
router.patch("/", isJustLoggedIn, async (req, res, next) => {
  let { username, current_password, new_password, first_name, last_name } = req.body;

  try {
    // 로그인 검증
    const user_id = getLoggedInUserId(req, res);
    const user = await User.findOne({ where: { id: user_id } }); // 현재 로그인한 사용자 정보

    // 변경 옵션
    let queryOptions = {};

    if (username) {
      username = sanitizeHtml(username);

      // 닉네임 검증
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "userExistsWithUsername",
          message: "새로운 닉네임과 동일한 닉네임으로 가입한 사용자가 이미 존재합니다",
        });
      }

      queryOptions.username = username;
    }
    if (first_name) {
      first_name = sanitizeHtml(first_name);
      queryOptions.first_name = first_name;
    }
    if (last_name) {
      last_name = sanitizeHtml(last_name);
      queryOptions.last_name = last_name;
    }

    // 비밀번호를 바꾸는 경우
    if (current_password && new_password) {
      // 비밀번호 확인
      const isMatch = await bcrypt.compare(current_password, user.password);

      if (isMatch) {
        if (new_password.length < 8) {
          return res.status(400).json({
            success: false,
            error: "contentNotEnough",
            message: "새로운 비밀번호의 길이가 충분하지 않습니다 (8 이상)",
          });
        }

        // 일치할 경우
        const hash = await bcrypt.hash(new_password, 12);
        queryOptions.password = hash;
      } else {
        return res.status(401).json({
          success: false,
          error: "authFails",
          message: "사용자 비밀번호가 일치하지 않습니다",
        });
      }
    } else if (current_password && !new_password) {
      return res.status(400).json({
        success: false,
        error: "formFieldsEmpty",
        message: "새로운 비밀번호가 입력되지 않았습니다",
      });
    } else if (!current_password && new_password) {
      return res.status(400).json({
        success: false,
        error: "formFieldsEmpty",
        message: "기존의 비밀번호가 입력되지 않았습니다",
      });
    }

    await User.update(queryOptions, { where: { id: user_id } });
    return res.status(200).json({
      success: true,
      message: "사용자 정보 수정에 성공했습니다",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "사용자 정보 수정에 실패했습니다",
    });
  }
});

// 로그인한 사용자 탈퇴 (비밀번호 일치할 경우만 성공)
router.delete("/", isJustLoggedIn, async (req, res, next) => {
  const { password } = req.body;
  try {
    if (!password) {
      return res.status(401).json({
        success: false,
        error: "authFails",
        message: "사용자 비밀번호가 주어지지 않았습니다",
      });
    }
    // 로그인 검증
    const user_id = getLoggedInUserId(req, res);
    const user = await User.findOne({ where: { id: user_id } }); // 현재 로그인한 사용자 정보

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "authFails",
        message: "사용자 비밀번호가 일치하지 않습니다",
      });
    }

    // 사용자 삭제
    await User.destroy({ where: { id: user_id } });
    return res.json({
      success: true,
      message: "사용자 탈퇴에 성공했습니다",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "사용자 탈퇴에 실패했습니다",
    });
  }
});

module.exports = router;
