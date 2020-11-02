const Sequelize = require("sequelize");

module.exports = class TestQuestion extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {},
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "test_question",
        tableName: "test_questions",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.TestQuestion.belongsTo(db.TestSet, {
      foreignKey: {
        name: "test_set_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.TestQuestion.belongsTo(db.Question, {
      foreignKey: {
        name: "question_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
