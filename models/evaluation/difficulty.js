const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        score: {
          type: Sequelize.INTEGER,
          default_value: 0,
          comment: "난이도",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "Difficulty",
        tableName: "difficulties",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Difficulty.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.Difficulty.belongsTo(db.Question, {
      foreignKey: {
        name: "question_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
