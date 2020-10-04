module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "commentable_entity",
    {
      entity_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: "댓글 객체 타입",
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
