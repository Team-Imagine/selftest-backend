const Sequelize = require("sequelize");

module.exports = class QuestionViewLog extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {},
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "question_view_log",
        tableName: "question_view_logs",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.QuestionViewLog.belongsTo(db.Question, {
      foreignKey: {
        name: "question_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.QuestionViewLog.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
