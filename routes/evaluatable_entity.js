var express = require("express");
var router = express.Router();

// evaluation_entity
router.get("/", function (req, res, next) {
  res.send("evaluation_entity's list");
});

router.get("/:id", function (req, res, next) {
  res.send("evaluation_entity " + req.params.id);
});

router.post("/:id", function (req, res, next) {
  res.send("new evaluation_entity");
});

router.put("/:id", function (req, res, next) {
  res.send("update evaluation_entity");
});

router.delete("/:id", function (req, res, next) {
  res.send("delete evaluation_entity");
});
module.exports = router;