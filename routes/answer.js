var express = require("express");
var router = express.Router();

// questions - answers
router.get("/", function (req, res, next) {
  res.send("question's answers");
});

router.get("/:id", function (req, res, next) {
  res.send("question " + req.params.id + " answers");
});

router.post("/:id", function (req, res, next) {
  res.send("new answers");
});

router.put("/:id", function (req, res, next) {
  res.send("update answers");
});

router.delete("/:id", function (req, res, next) {
  res.send("delete answers");
});
module.exports = router;
