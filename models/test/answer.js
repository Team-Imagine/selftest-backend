const Sequelize = require("sequelize");

module.exports = class Answer extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
          defaultValue: "active",
          comment: "내용",
        },
        blocked: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: false,
          comment: "블라인드 여부",
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        underscored: true,
        modelName: "answer",
        tableName: "answers",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Answer.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.Answer.belongsTo(db.Question, {
      foreignKey: {
        name: "question_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.Answer.belongsTo(db.CommentableEntity, {
      foreignKey: {
        name: "commentable_entity_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.Answer.belongsTo(db.LikeableEntity, {
      foreignKey: {
        name: "likeable_entity_id",
        allowNull: false,
      },
      targetKey: "id",
    });
  }
};
