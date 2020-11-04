const Sequelize = require("sequelize");

module.exports = class ShortAnswerItem extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        item_text: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "정답 예시",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "short_answer_item",
        tableName: "short_answer_items",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.ShortAnswerItem.belongsTo(db.Question, {
      foreignKey: {
        name: "question_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
