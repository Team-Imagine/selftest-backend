const path = require("path");
const Sequelize = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require("./user/user")(sequelize, Sequelize);
db.Question = require("./test/question")(sequelize, Sequelize);
db.Answer = require("./test/answer")(sequelize, Sequelize);
db.Subject = require("./course/subject")(sequelize, Sequelize);
db.Course = require("./course/course")(sequelize, Sequelize);
db.Bookmark = require("./user/bookmark")(sequelize, Sequelize);
db.TestSet = require("./test/test_set")(sequelize, Sequelize);
db.TestQuestion = require("./test/test_question")(sequelize, Sequelize);
db.LikeableEntity = require("./evaluation/likeable_entity")(sequelize, Sequelize);
db.Like = require("./evaluation/like")(sequelize, Sequelize);
db.Difficulty = require("./evaluation/difficulty")(sequelize, Sequelize);
db.Freshness = require("./evaluation/freshness")(sequelize, Sequelize);
db.CommentableEntity = require("./comment/commentable_entity")(sequelize, Sequelize);
db.Comment = require("./comment/comment")(sequelize, Sequelize);
db.PointLog = require("./user/point_log")(sequelize, Sequelize);
db.PenaltyLog = require("./user/penalty_log")(sequelize, Sequelize);
db.Attendance = require("./user/attendance")(sequelize, Sequelize);

// Define database relationship
db.Subject.hasMany(db.Course, { foreignKey: "subject_id", sourceKey: "id" });
db.Course.belongsTo(db.Subject, { foreignKey: "subject_id", targetKey: "id" });
db.Course.hasMany(db.Question, { foreignKey: "course_id", sourceKey: "id" });
db.Question.belongsTo(db.Course, { foreignKey: "course_id", targetKey: "id" });

db.User.hasMany(db.TestSet, { foreignKey: "user_id", sourceKey: "id" });
db.TestSet.belongsTo(db.User, { foreignKey: "user_id", targetKey: "id" });
db.TestSet.hasMany(db.TestQuestion, { foreignKey: "test_set_id", sourceKey: "id" });
db.TestQuestion.belongsTo(db.User, { foreignKey: "test_set_id", targetKey: "id" });
db.TestQuestion.belongsTo(db.TestQuestion, { foreignKey: "question_id", targetKey: "id" });

db.User.hasMany(db.Question, { foreignKey: "user_id", sourceKey: "id" });
db.Question.belongsTo(db.User, { foreignKey: "user_id", targetKey: "id" });
db.Question.hasMany(db.Answer, { foreignKey: "question_id", sourceKey: "id" });
db.Question.belongsTo(db.CommentableEntity, { foreignKey: "commentable_entity_id", targetKey: "id" });
db.Question.belongsTo(db.LikeableEntity, { foreignKey: "likeable_entity_id", targetKey: "id" });

db.User.hasMany(db.Answer, { foreignKey: "user_id", sourceKey: "id" });
db.Answer.belongsTo(db.User, { foreignKey: "user_id", targetKey: "id" });
db.Answer.belongsTo(db.Question, { foreignKey: "question_id", targetKey: "id" });
db.Answer.belongsTo(db.CommentableEntity, { foreignKey: "commentable_entity_id", targetKey: "id" });
db.Answer.belongsTo(db.LikeableEntity, { foreignKey: "likeable_entity_id", targetKey: "id" });

db.User.hasMany(db.Bookmark, { foreignKey: "user_id", sourceKey: "id" });
db.Bookmark.belongsTo(db.User, { foreignKey: "user_id", targetKey: "id" });
db.Bookmark.belongsTo(db.Question, { foreignKey: "question_id", targetKey: "id" });

db.CommentableEntity.hasMany(db.Comment, { foreignKey: "commentable_entity_id", sourceKey: "id" });
db.Comment.belongsTo(db.CommentableEntity, { foreignKey: "commentable_entity_id", targetKey: "id" });
db.User.hasMany(db.Comment, { foreignKey: "user_id", sourceKey: "id" });
db.Comment.belongsTo(db.User, { foreignKey: "user_id", targetKey: "id" });

db.LikeableEntity.hasMany(db.Like, { foreignKey: "likeable_entity_id", sourceKey: "id" });
db.Like.belongsTo(db.LikeableEntity, { foreignKey: "likeable_entity_id", targetKey: "id" });
db.User.hasMany(db.Like, { foreignKey: "user_id", sourceKey: "id" });
db.Like.belongsTo(db.User, { foreignKey: "user_id", targetKey: "id" });

db.User.hasMany(db.Difficulty, { foreignKey: "user_id", sourceKey: "id" });
db.Difficulty.belongsTo(db.User, { foreignKey: "user_id", targetKey: "id" });
db.Difficulty.belongsTo(db.Question, { foreignKey: "question_id", targetKey: "id" });

db.User.hasMany(db.Freshness, { foreignKey: "user_id", sourceKey: "id" });
db.Freshness.belongsTo(db.User, { foreignKey: "user_id", targetKey: "id" });
db.Freshness.belongsTo(db.Question, { foreignKey: "question_id", targetKey: "id" });

db.User.hasMany(db.PointLog, { foreignKey: "user_id", sourceKey: "id" });
db.PointLog.belongsTo(db.User, { foreignKey: "user_id", targetKey: "id" });
db.User.hasMany(db.PenaltyLog, { foreignKey: "user_id", sourceKey: "id" });
db.PenaltyLog.belongsTo(db.User, { foreignKey: "user_id", targetKey: "id" });

db.User.hasMany(db.Attendance, { foreignKey: "user_id", sourceKey: "id" });
db.Attendance.belongsTo(db.User, { foreignKey: "user_id", targetKey: "id" });

module.exports = db;
