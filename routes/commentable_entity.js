var express = require("express");
var router = express.Router();

// commentable_entity
router.get("/", function (req, res, next) {
  res.send("commentable_entity's list");
});

router.get("/:id", function (req, res, next) {
  res.send("commentable_entity " + req.params.id);
});

router.post("/:id", function (req, res, next) {
  res.send("new commentable_entity");
});

router.put("/:id", function (req, res, next) {
  res.send("update commentable_entity");
});

router.delete("/:id", function (req, res, next) {
  res.send("delete commentable_entity");
});
module.exports = router;