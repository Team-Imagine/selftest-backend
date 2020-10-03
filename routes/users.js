var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("user list");
});

// users - user
router.get("/:id", function (req, res, next) {
  res.send("user " + req.params.id + " data" );
});

router.post("/:id", function (req, res, next) {
  res.send("new user: " + req.params.id);
});

router.put("/:id", function (req, res, next) {
  res.send("update user: " + req.params.id);
});

router.delete("/:id", function (req, res, next) {
  res.send("delete user: " + req.params.id);
});

module.exports = router;
