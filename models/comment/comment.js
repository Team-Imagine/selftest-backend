module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "comment",
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "댓글 내용",
      },
    },
    {
      timestamps: true,
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
};
