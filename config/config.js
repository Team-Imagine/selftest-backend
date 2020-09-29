require("dotenv").config();

module.exports = {
  development: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "selftest_dev",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorAliases: false,
  },
  test: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "selftest_test",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorAliases: false,
  },
  production: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "selftest",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorAliases: false,
    logging: false,
  },
};
