module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "subject",
    {
      title: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: "과목 이름",
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
