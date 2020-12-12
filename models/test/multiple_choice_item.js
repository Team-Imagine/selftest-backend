const Sequelize = require("sequelize");

module.exports = class MultipleChoiceItem extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        item_text: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "보기 내용",
        },
        checked: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: false,
          comment: "정답 여부",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "multiple_choice_item",
        tableName: "multiple_choice_items",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.MultipleChoiceItem.belongsTo(db.Question, {
      foreignKey: {
        name: "question_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
