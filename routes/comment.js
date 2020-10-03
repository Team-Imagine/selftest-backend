var express = require("express");
var router = express.Router();

// comment
router.get("/", function (req, res, next) {
  res.send("comment's list");
});

router.get("/:id", function (req, res, next) {
  res.send("comment" + req.params.id);
});

router.post("/:id", function (req, res, next) {
  res.send("new comment");
});

router.put("/:id", function (req, res, next) {
  res.send("update comment");
});

router.delete("/:id", function (req, res, next) {
  res.send("delete comment");
});
module.exports = router;