const Sequelize = require("sequelize");

module.exports = class Subject extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        title: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
          comment: "과목 이름",
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        underscored: true,
        modelName: "Subject",
        tableName: "subjects",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Subject.hasMany(db.Course, {
      foreignKey: {
        name: "subject_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
  }
};
