const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        entity_type: {
          type: Sequelize.STRING(20),
          allowNull: false,
          comment: "댓글 객체 타입",
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        underscored: true,
        modelName: "CommentableEntity",
        tableName: "commentable_entities",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.CommentableEntity.hasMany(db.Comment, {
      foreignKey: {
        name: "commentable_entity_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
  }
};
