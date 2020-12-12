const Sequelize = require("sequelize");

module.exports = class UserRole extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        user_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        role_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        underscored: true,
        modelName: "user_role",
        tableName: "user_roles",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.UserRole.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      targetKey: "id",
      onDelete: "CASCADE",
    });
    db.UserRole.belongsTo(db.Role, {
      foreignKey: {
        name: "role_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
