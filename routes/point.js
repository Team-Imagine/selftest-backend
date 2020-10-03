var express = require("express");
var router = express.Router();

// user - point_log
router.get("/", function (req, res, next) {
  res.send("user's point_log");
});

router.get("/:id", function (req, res, next) {
  res.send("user " + req.params.id + " point_log");
});

router.post("/:id", function (req, res, next) {
  res.send("new point_log");
});

router.put("/:id", function (req, res, next) {
  res.send("update point_log");
});

router.delete("/:id", function (req, res, next) {
  res.send("delete point_log");
});
module.exports = router;