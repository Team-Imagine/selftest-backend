var express = require("express");
var router = express.Router();

// test_question
router.get("/", function (req, res, next) {
  res.send("test_question's list");
});

router.get("/:id", function (req, res, next) {
  res.send("test_question " + req.params.id);
});

router.post("/:id", function (req, res, next) {
  res.send("new test_question");
});

router.put("/:id", function (req, res, next) {
  res.send("update test_question");
});

router.delete("/:id", function (req, res, next) {
  res.send("delete test_question");
});
module.exports = router;