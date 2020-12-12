const Sequelize = require("sequelize");

module.exports = class Dislike extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        bad: {
          type: Sequelize.INTEGER,
          default_value: 1,
          allowNull: false,
          comment: "싫어요",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "dislike",
        tableName: "dislikes",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Dislike.belongsTo(db.LikeableEntity, {
      foreignKey: {
        name: "likeable_entity_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.Dislike.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
