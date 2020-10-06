var express = require("express");
var router = express.Router();

const { Difficulty } = require("../models");

// difficulty
router.get("/", function (req, res, next) {
  res.send("difficulty list");
});

router.get("/:type", async (req, res, next) => {
  res.send("difficulty " + req.params.type + " data");
});

// CREATE // take difficulty from react page & store data to db
router.post("/", async (req, res, next) => {
  const { score, question_id, user_id } = req.body;

  try {
    await Difficulty.create({
      score,
      question_id,
      user_id,
    });

    console.log('success');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.patch("/", async (req, res, next) => {
  const { score, user_id, question_id } = req.body;

  await Difficulty.update({
    score: score
  },
    {
      where: {
        user_id: user_id,
        question_id: question_id,
      }
    })
    .then((result) => {

    })
    .catch((err) => {
      console.log(err);
      next(err);
    })
});

router.delete("/", async (req, res, next) => {
  const { user_id, question_id } = req.body;

  await Difficulty.destroy({
    where: {
      user_id: user_id,
      question_id: question_id,
    }
  })
    .then((result) => {

    })
    .catch((err) => {
      console.error(err);
      next(err);
    })
});



module.exports = router;