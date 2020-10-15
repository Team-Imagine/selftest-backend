const Sequelize = require("sequelize");

module.exports = class LikeableEntity extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        entity_type: {
          type: Sequelize.STRING(20),
          allowNull: false,
          comment: "좋아요 객체 타입",
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        underscored: true,
        modelName: "LikeableEntity",
        tableName: "likeable_entities",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.LikeableEntity.hasMany(db.Like, {
      foreignKey: {
        name: "likeable_entity_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
  }
};
