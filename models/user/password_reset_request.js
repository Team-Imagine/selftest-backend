const Sequelize = require("sequelize");

module.exports = class PasswordResetRequest extends (
  Sequelize.Model
) {
  static init(sequelize) {
    return super.init(
      {
        code: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
          comment: "비밀번호 초기화 인증 코드",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "password_reset_request",
        tableName: "password_reset_requests",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.PasswordResetRequest.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
  }
};
