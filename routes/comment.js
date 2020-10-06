var express = require("express");
var router = express.Router();

const { Comment } = require("../models");

// comment
router.get("/", function (req, res, next) {
  res.send("comment list");
});

router.get("/:type", async (req, res, next) => {
  res.send("comment " + req.params.type + " data");
});

// CREATE // take comment from react page & store data to db
router.post("/", async (req, res, next) => {
  const { content, commentable_entity_id, user_id} = req.body;

  try {
    await comment.create({
      content,
      commentable_entity_id,
      user_id,
    });
    
    console.log('success');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.patch("/", async (req, res, next) => {
    const { content, commentable_entity_id } = req.body;

    await Comment.update({
      comment: content
    },
      {
        where: {
            id: commentable_entity_id,
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
  const { commentable_entity_id } = req.body;
  
  await Comment.destroy({where: { id: commentable_entity_id }})
    .then((result) => {

    })
    .catch((err) => {
      console.error(err);
      next(err);
    })
});

module.exports = router;