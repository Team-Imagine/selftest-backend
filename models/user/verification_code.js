const Sequelize = require("sequelize");

module.exports = class VerificationCode extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        code: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
          comment: "이메일 인증 코드",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "verification_code",
        tableName: "verification_codes",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.VerificationCode.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
  }
};
