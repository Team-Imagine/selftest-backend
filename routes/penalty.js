var express = require("express");
var router = express.Router();

// users - user - penalty_log
router.get("/", function (req, res, next) {
  res.send("user's penalty_log");
});

router.get("/:id", function (req, res, next) {
  res.send("user " + req.params.id + " penalty_log");
});

router.post("/:id", function (req, res, next) {
  res.send("new penalty_log");
});

router.put("/:id", function (req, res, next) {
  res.send("update penalty_log");
});

router.delete("/:id", function (req, res, next) {
  res.send("delete penalty_log");
});

module.exports = router;