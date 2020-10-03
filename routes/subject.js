var express = require("express");
var router = express.Router();

// subject
router.get("/", function (req, res, next) {
  res.send("subject's list");
});

router.get("/:id", function (req, res, next) {
  res.send("subject " + req.params.id);
});

router.post("/:id", function (req, res, next) {
  res.send("new subject");
});

router.put("/:id", function (req, res, next) {
  res.send("update subject");
});

router.delete("/:id", function (req, res, next) {
  res.send("delete subject");
});
module.exports = router;