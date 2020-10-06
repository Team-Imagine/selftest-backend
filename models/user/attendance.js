module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "attendance",
    {},
    {
      timestamps: true,
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
};
