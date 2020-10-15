const Sequelize = require("sequelize");

module.exports = class TestQuestion extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {},
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "TestQuestion",
        tableName: "test_questions",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.TestQuestion.belongsTo(db.User, {
      foreignKey: {
        name: "test_set_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.TestQuestion.belongsTo(db.TestQuestion, {
      foreignKey: {
        name: "question_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
