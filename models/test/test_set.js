const Sequelize = require("sequelize");

module.exports = class TestSet extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {},
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "TestSet",
        tableName: "test_sets",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.TestSet.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.TestSet.hasMany(db.TestQuestion, {
      foreignKey: {
        name: "test_set_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
  }
};
