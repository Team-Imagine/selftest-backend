const Sequelize = require("sequelize");

module.exports = class Comment extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
          comment: "댓글 내용",
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        underscored: true,
        modelName: "comment",
        tableName: "comments",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Comment.belongsTo(db.CommentableEntity, {
      foreignKey: {
        name: "commentable_entity_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.Comment.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
