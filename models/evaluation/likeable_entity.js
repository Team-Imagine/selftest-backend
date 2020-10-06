module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "likeable_entity",
    {
      entity_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: "좋아요 객체 타입",
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
