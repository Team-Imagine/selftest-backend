const Sequelize = require("sequelize");

module.exports = class Freshness extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        fresh: {
          type: Sequelize.INTEGER,
          default_value: 0,
          comment: "신선해요",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "Freshness",
        tableName: "freshnesses",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Freshness.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.Freshness.belongsTo(db.Question, {
      foreignKey: {
        name: "question_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
