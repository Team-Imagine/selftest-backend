var express = require("express");
var router = express.Router();

// question
router.get("/", function (req, res, next) {
  res.send("question's list");
});

router.get("/:id", function (req, res, next) {
  res.send("question " + req.params.id);
});

router.post("/:id", function (req, res, next) {
  res.send("new question");
});

router.put("/:id", function (req, res, next) {
  res.send("update question");
});

router.delete("/:id", function (req, res, next) {
  res.send("delete question");
});
module.exports = router;