var express = require("express");
var router = express.Router();

const { Freshness } = require("../models");

// freshness
router.get("/", function (req, res, next) {
  res.send("freshness list");
});

router.get("/:type", async (req, res, next) => {
  res.send("freshness " + req.params.type + " data");
});

// CREATE // take freshness from react page & store data to db
router.post("/", async (req, res, next) => {
  const { question_id, user_id, fresh } = req.body;

  try {
    await Freshness.create({
      fresh,
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
  res.send("update freshness: " + req.params.id);
});

router.delete("/", async (req, res, next) => {
  res.send("delete freshness: " + req.params.id);



});



module.exports = router;