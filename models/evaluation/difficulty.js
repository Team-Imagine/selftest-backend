module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "difficulty",
    {
      score: {
        type: DataTypes.INTEGER,
        default_value: 0,
        comment: "난이도",
      },
    },
    {
      timestamps: true,
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
};
