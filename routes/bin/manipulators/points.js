const { User, PointLog } = require("../../../models");

// 유저에게 포인트를 부여 (true: 성공, false: 실패)
module.exports.give_point = async function (user_id, amount, content) {
  try {
    // 포인트 로그 생성
    await PointLog.create({ amount, user_id, content });

    const user = await User.findOne({ attributes: ["point"], where: { id: user_id } });
    if (!user) {
      return false;
    }
    const user_point = user.point;

    await User.update({ point: Number(user_point) + Number(amount) }, { where: { id: user_id } });

    return {
      success: true,
      status: 200,
      message: "사용자에게 포인트를 지급하는 데 성공했습니다",
      amount,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      status: 400,
      error: "requestFails",
      message: "사용자에게 포인트를 지급하는 데 실패했습니다",
    };
  }
};

// 한 유저의 전체 포인트 로그를 열람하는 함수
module.exports.read_point_logs = async function (user_id) {
  try {
    let point_logs = await PointLog.findAll({
      attributes: ["user_id", "amount", "content", "createdAt"],
      where: { user_id },
      order: [["createdAt", "DESC"]],
    });

    return {
      success: true,
      status: 200,
      message: "사용자의 포인트 로그 조회에 성공했습니다",
      point_logs,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      status: 400,
      error: "requestFails",
      message: "사용자의 포인트 로그 조회에 실패했습니다",
    };
  }
};
