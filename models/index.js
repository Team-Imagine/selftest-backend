const Sequelize = require("sequelize");

const User = require("./user/user");
const Question = require("./test/question");
const QuestionViewLog = require("./test/question_view_log");
const MultipleChoiceItem = require("./test/multiple_choice_item");
const ShortAnswerItem = require("./test/short_answer_item");
const Answer = require("./test/answer");
const Subject = require("./course/subject");
const Course = require("./course/course");
const Bookmark = require("./user/bookmark");
const TestSet = require("./test/test_set");
const TestQuestion = require("./test/test_question");
const LikeableEntity = require("./evaluation/likeable_entity");
const Like = require("./evaluation/like");
const Difficulty = require("./evaluation/difficulty");
const Freshness = require("./evaluation/freshness");
const CommentableEntity = require("./comment/commentable_entity");
const Comment = require("./comment/comment");
const PointLog = require("./user/point_log");
const PenaltyLog = require("./user/penalty_log");
const Attendance = require("./user/attendance");
const VerificationCode = require("./user/verification_code");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);
db.sequelize = sequelize;

db.User = User;
db.Question = Question;
db.QuestionViewLog = QuestionViewLog;
db.MultipleChoiceItem = MultipleChoiceItem;
db.ShortAnswerItem = ShortAnswerItem;
db.Answer = Answer;
db.Subject = Subject;
db.Course = Course;
db.Bookmark = Bookmark;
db.TestSet = TestSet;
db.TestQuestion = TestQuestion;
db.LikeableEntity = LikeableEntity;
db.Like = Like;
db.Difficulty = Difficulty;
db.Freshness = Freshness;
db.CommentableEntity = CommentableEntity;
db.Comment = Comment;
db.PointLog = PointLog;
db.PenaltyLog = PenaltyLog;
db.Attendance = Attendance;
db.VerificationCode = VerificationCode;

User.init(sequelize);
Question.init(sequelize);
QuestionViewLog.init(sequelize);
MultipleChoiceItem.init(sequelize);
ShortAnswerItem.init(sequelize);
Answer.init(sequelize);
Subject.init(sequelize);
Course.init(sequelize);
Bookmark.init(sequelize);
TestSet.init(sequelize);
TestQuestion.init(sequelize);
LikeableEntity.init(sequelize);
Like.init(sequelize);
Difficulty.init(sequelize);
Freshness.init(sequelize);
CommentableEntity.init(sequelize);
Comment.init(sequelize);
PointLog.init(sequelize);
PenaltyLog.init(sequelize);
Attendance.init(sequelize);
VerificationCode.init(sequelize);

User.associate(db);
Question.associate(db);
QuestionViewLog.associate(db);
MultipleChoiceItem.associate(db);
ShortAnswerItem.associate(db);
Answer.associate(db);
Subject.associate(db);
Course.associate(db);
Bookmark.associate(db);
TestSet.associate(db);
TestQuestion.associate(db);
LikeableEntity.associate(db);
Like.associate(db);
Difficulty.associate(db);
Freshness.associate(db);
CommentableEntity.associate(db);
Comment.associate(db);
PointLog.associate(db);
PenaltyLog.associate(db);
Attendance.associate(db);
VerificationCode.associate(db);

module.exports = db;
