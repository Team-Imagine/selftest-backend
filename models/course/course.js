const Sequelize = require("sequelize");

module.exports = class Course extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        title: {
          type: Sequelize.STRING(60),
          allowNull: false,
          unique: true,
          comment: "강의 이름",
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        underscored: true,
        modelName: "Course",
        tableName: "courses",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Course.belongsTo(db.Subject, {
      foreignKey: {
        name: "subject_id",
        allowNull: false,
      },
      targetKey: "id",
    });
    db.Course.hasMany(db.Question, {
      foreignKey: {
        name: "course_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
  }
};
