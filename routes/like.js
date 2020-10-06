var express = require("express");
var router = express.Router();

const { Like } = require("../models");

// like
router.get("/", function (req, res, next) {
  res.send("like list");
});

router.get("/:type", async (req, res, next) => {
  res.send("like " + req.params.type + " data");
});

// CREATE // take like from react page & store data to db
router.post("/", async (req, res, next) => {
  const { good, likeable_entity_id, user_id} = req.body;

  try {
    await Like.create({
      good,
      likeable_entity_id,
      user_id,
    });
    
    console.log('success');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.put("/:id", function (req, res, next) {
  res.send("update like: " + req.params.id);
});

router.delete("/", async (req, res, next) => {
  const { likeable_entity_id } = req.body;
  
  Like.destroy({where: { id: likeable_entity_id }})
    .then((result) => {

    })
    .catch((err) => {
      console.error(err);
      next(err);
    })
});

module.exports = router;