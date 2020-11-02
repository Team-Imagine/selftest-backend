const Sequelize = require("sequelize");

module.exports = class Question extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        title: {
          type: Sequelize.STRING(60),
          allowNull: false,
          comment: "문제 제목",
        },
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
        modelName: "question",
        tableName: "questions",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Question.belongsTo(db.Course, {
      foreignKey: {
        name: "course_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.Question.belongsTo(db.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.Question.hasMany(db.Answer, {
      foreignKey: {
        name: "question_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.Question.belongsTo(db.CommentableEntity, {
      foreignKey: {
        name: "commentable_entity_id",
        allowNull: true,
      },
      targetKey: "id",
    });
    db.Question.belongsTo(db.LikeableEntity, {
      foreignKey: {
        name: "likeable_entity_id",
        allowNull: true,
      },
      targetKey: "id",
    });
  }
};
