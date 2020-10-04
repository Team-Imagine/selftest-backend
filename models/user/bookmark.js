module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "bookmark",
    {},
    {
      timestamps: true,
      paranoid: true,
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
};
