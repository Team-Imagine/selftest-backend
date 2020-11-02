const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: Sequelize.STRING(62),
          allowNull: false,
          unique: true,
          comment: "이메일",
        },
        username: {
          type: Sequelize.STRING(20),
          allowNull: false,
          unique: true,
          comment: "닉네임",
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "비밀번호",
        },
        first_name: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: "이름",
        },
        last_name: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: "성",
        },
        phone_number: {
          type: Sequelize.STRING(20),
          comment: "전화번호",
        },
        point: {
          type: Sequelize.INTEGER,
          defaultValue: 100,
          comment: "보유 포인트",
        },
        active: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: true,
          comment: "상태",
        },
        verified: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: false,
          comment: "이메일 인증 여부",
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        underscored: true,
        modelName: "user",
        tableName: "users",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.User.hasMany(db.TestSet, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.Question, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.Answer, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.Bookmark, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.Comment, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.Like, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.Difficulty, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.Freshness, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.PointLog, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.PenaltyLog, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.Attendance, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      sourceKey: "id",
      onDelete: "CASCADE",
    });
  }
};
