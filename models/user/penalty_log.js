const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        term: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          comment: "제재 기간 (분)",
        },
        content: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "제재 내용",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "PenaltyLog",
        tableName: "penalty_logs",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.PenaltyLog.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
