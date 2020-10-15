const Sequelize = require("sequelize");

module.exports = class Like extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        good: {
          type: Sequelize.INTEGER,
          default_value: 0,
          comment: "좋아요",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "Like",
        tableName: "likes",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Like.belongsTo(db.LikeableEntity, {
      foreignKey: {
        name: "likeable_entity_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.Like.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
