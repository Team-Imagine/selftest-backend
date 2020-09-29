module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "answer",
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "active",
        comment: "내용",
      },
      blocked: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: false,
        comment: "블라인드 여부",
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
