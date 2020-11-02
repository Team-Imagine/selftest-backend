const Sequelize = require("sequelize");

module.exports = class PenaltyLog extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        termination_date: {
          type: Sequelize.DATE,
          allowNull: false,
          comment: "제재 종료 시각",
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
        modelName: "penalty_log",
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
