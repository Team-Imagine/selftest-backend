var express = require("express");
var router = express.Router();

// users - user - bookmark
router.get("/", function (req, res, next) {
  res.send("user's bookmark list");
});

router.get("/:id", function (req, res, next) {
  res.send("user " + req.params.id + " bookmark");
});

router.post("/:id", function (req, res, next) {
  res.send("new bookmark");
});

router.delete("/:id", function (req, res, next) {
  res.send("delete bookmark");
});

module.exports = router;