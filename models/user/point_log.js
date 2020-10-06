module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "point_log",
    {
      amount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "점수 변동 내용",
      },
      content: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "포인트 내용",
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
