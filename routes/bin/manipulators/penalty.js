const { User, Question, PenaltyLog } = require("../../../models");
const { get_likes, get_dislikes } = require("./evaluations");

// 문제가 블라인드 처리되어야 하는지 검증 (true: 블라인드 처리, false: 오류 또는 블라인드 처리하지 않음)
module.exports.decide_block_question = async function (question_id) {
  try {
    const question = await Question.findOne({ where: { id: question_id } });

    // 좋아요 및 싫어요 정보
    const likes = parseInt(await get_likes(question.likeable_entity_id));
    const dislikes = parseInt(await get_dislikes(question.likeable_entity_id));

    // 블라인드 조건: 싫어요 20개 이상 & 싫어요 / 좋아요  2 이상
    if (dislikes >= 20 && dislikes / likes > 2) {
      await Question.update({ blocked: true }, { where: { question_id } });
    }
    return {
      success: true,
      status: 200,
      message: "문제 블라인드 처리에 성공했습니다",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      status: 400,
      error: "requestFails",
      message: "블라인드 처리에 실패했습니다",
    };
  }
};

// 사용자에게 제재 (패널티)를 부여 (true: 성공, false: 실패)
module.exports.give_penalty = async function (user_id, content) {
  // 제재 종료 시각 설정
  let termination_date = new Date();
  termination_date.setDate(termination_date.getDate() + 3);

  try {
    // 제재 로그에 추가
    await PenaltyLog.create({ termination_date, content, user_id });

    // 사용자 활동 상태를 정지 상태로 변경
    await User.update({ active: false }, { where: { id: user_id } });
    return {
      success: true,
      status: 200,
      message: "사용자 제재 처리에 성공했습니다",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      status: 400,
      error: "requestFails",
      message: "사용자 제재 처리에 실패했습니다",
    };
  }
};

// 사용자에게 부여했던 (최신의) 제재가 풀렸는지 확인 후 처리
// (true: 블라인드 처리 해제, false: 오류 또는 아직 제재 기간 남아있음)
module.exports.decide_penalty_gone = async function (user_id) {
  try {
    // 0번 인덱스에 날짜상 맨 위의 (유효한) 제재 내역
    const penalties = await PenaltyLog.findAll({
      limit: 1,
      where: { user_id },
      order: [["createdAt", "DESC"]],
    });

    if (!penalties || penalties.length < 1) {
      // 제재 내역이 존재하지 않음
      return {
        success: false,
        status: 200,
        message: "사용자 제재 내역이 존재하지 않습니다",
      };
    }

    // 제재 만료 시간이 지났는지 확인
    let termination_date = new Date(penalties[0].termination_date);
    if (termination_date < new Date()) {
      // 제재 만료 시간이 지남
      // 사용자 활동 상태를 정지 상태로 변경
      await User.update({ active: false }, { where: { id: user_id } });

      return {
        success: true,
        status: 200,
        message: "사용자 제재 종료 처리에 성공했습니다",
      };
    } else {
      // 제재 만료 시간이 아직 지나지 않음
      return {
        success: false,
        status: 200,
        message: "사용자 제재 기간이 아직 끝나지 않았습니다",
      };
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      status: 400,
      error: "requestFails",
      message: "제재 종료 여부 확인 실패",
    };
  }
};
