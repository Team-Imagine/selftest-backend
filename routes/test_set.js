var express = require("express");
var router = express.Router();

// test_set
router.get("/", function (req, res, next) {
  res.send("test_set's list");
});

router.get("/:id", function (req, res, next) {
  res.send("test_set " + req.params.id);
});

router.post("/:id", function (req, res, next) {
  res.send("new test_set");
});

router.put("/:id", function (req, res, next) {
  res.send("update test_set");
});

router.delete("/:id", function (req, res, next) {
  res.send("delete test_set");
});
module.exports = router;