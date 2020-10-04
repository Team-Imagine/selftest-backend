module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "user",
    {
      email: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
        comment: "이메일",
      },
      username: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: "닉네임",
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: "비밀번호",
      },
      first_name: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: "이름",
      },
      last_name: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: "성",
      },
      phone_number: {
        type: DataTypes.STRING(20),
        comment: "전화번호",
      },
      point: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "보유 포인트",
      },
      active: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: true,
        comment: "상태",
      },
    },
    {
      timestamps: true,
      paranoid: true,
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
};
