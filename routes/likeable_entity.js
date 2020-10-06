var express = require("express");
var router = express.Router();

const { LikeableEntity } = require("../models");

// LikeableEntity
router.get("/", function (req, res, next) {
  res.send("LikeableEntity list");
});

router.get("/:type", async (req, res, next) => {
  res.send("LikeableEntity " + req.params.type + " data");
});

// CREATE // take LikeableEntity from react page & store data to db
router.post("/", async (req, res, next) => {
  const { entity_type } = req.body;

  try {
    await LikeableEntity.create({
      entity_type,
    });

    console.log('success');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.put("/:id", function (req, res, next) {
  res.send("update LikeableEntity: " + req.params.id);
});

router.delete("/", async (req, res, next) => {
  res.send("delete LikeableEntity: " + req.params.id);



});



module.exports = router;