module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "penalty",
    {
      term: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "제재 기간 (분)",
      },
      content: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "제재 내용",
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
