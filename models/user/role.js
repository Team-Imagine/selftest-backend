const Sequelize = require("sequelize");

module.exports = class Role extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        role_name: {
          type: Sequelize.STRING(25),
          allowNull: false,
          unique: true,
          comment: "역할 이름",
        },
      },
      {
        sequelize,
        paranoid: true,
        underscored: true,
        modelName: "role",
        tableName: "roles",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Role.hasOne(db.UserRole, {
      foreignKey: {
        name: "role_id",
        allowNull: false,
      },
      sourceKey: "id",
    });
  }
};
