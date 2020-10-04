module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "evaluation",
    {
      good: {
        type: DataTypes.INTEGER,
        default_value: 0,
        comment: "좋아요",
      },
      fresh: {
        type: DataTypes.INTEGER,
        default_value: 0,
        comment: "신선해요",
      },
    },
    {
      timestamps: true,
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
};
