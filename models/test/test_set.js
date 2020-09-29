module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "test_set",
    {},
    {
      timestamps: true,
      paranoid: true,
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
};
