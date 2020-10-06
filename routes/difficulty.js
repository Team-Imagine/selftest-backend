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
  const { score, question_id, user_id  } = req.body;

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

router.put("/:id", function (req, res, next) {
  res.send("update difficulty: " + req.params.id);
});

router.delete("/", async (req, res, next) => {
  res.send("delete difficulty: " + req.params.id);



});



module.exports = router;