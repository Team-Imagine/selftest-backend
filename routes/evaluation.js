var express = require("express");
var router = express.Router();

/* GET evaluaions listing. */
router.get("/", function (req, res, next) {
  res.send("evaluation's list");
});

router.get("/:id", function (req, res, next) {
  res.send("evaluation " + req.params.id);
});

router.post("/:id", function (req, res, next) {
  res.send("new evaluation");
});

router.put("/:id", function (req, res, next) {
  res.send("update evaluation");
});

router.delete("/:id", function (req, res, next) {
  res.send("delete evaluation");
});


module.exports = router;