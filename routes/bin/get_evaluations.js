const { Like, Dislike, Difficulty, Freshness } = require("../../models");
const sequelize = require("sequelize");

module.exports.get_likes = async function (likeable_entity_id) {
  const likes = await Like.findAll({
    attributes: ["likeable_entity_id", [sequelize.fn("COUNT", sequelize.col("good")), "total_likes"]],
    where: {
      likeable_entity_id,
    },
    raw: true,
  });
  return likes[0];
};

module.exports.get_dislikes = async function (likeable_entity_id) {
  const dislikes = await Dislike.findAll({
    attributes: ["likeable_entity_id", [sequelize.fn("COUNT", sequelize.col("bad")), "total_dislikes"]],
    where: {
      likeable_entity_id,
    },
    raw: true,
  });
  return dislikes[0];
};

module.exports.get_average_difficulty = async function (question_id) {
  const average_difficulty = await Difficulty.findAll({
    attributes: [[sequelize.fn("COUNT", sequelize.col("score")), "average_difficulty"]],
    where: {
      question_id,
    },
    raw: true,
  });

  return average_difficulty[0];
};

module.exports.get_average_freshness = async function (question_id) {
  const average_freshness = await Freshness.findAll({
    attributes: [[sequelize.fn("COUNT", sequelize.col("fresh")), "average_freshness"]],
    where: {
      question_id,
    },
    raw: true,
  });

  return average_freshness[0];
};
