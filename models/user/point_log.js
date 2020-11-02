const Sequelize = require("sequelize");

module.exports = class PointLog extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        amount: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          comment: "점수 변동 내용",
        },
        content: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "포인트 내용",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "point_log",
        tableName: "point_logs",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.PointLog.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
