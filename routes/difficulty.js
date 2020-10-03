var express = require("express");
var router = express.Router();

// difficulty
router.get("/", function (req, res, next) {
  res.send("question's difficulty");
});

router.get("/:id", function (req, res, next) {
  res.send("question " + req.params.id + " difficulty");
});

router.post("/:id", function (req, res, next) {
  res.send("new difficulty");
});

router.put("/:id", function (req, res, next) {
  res.send("update difficulty");
});

router.delete("/:id", function (req, res, next) {
  res.send("delete difficulty");
});
module.exports = router;