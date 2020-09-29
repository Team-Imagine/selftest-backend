var express = require("express");
var router = express.Router();

/* GET tests listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/answer", function (req, res, next) {
  res.send("/test/answer");
});

router.get("/question", function (req, res, next) {
  res.send("/test/question");
});

router.get("/test_question", function (req, res, next) {
  res.send("/test/test_question");
});

router.get("/test_set", function (req, res, next) {
  res.send("/test/test_set");
});


module.exports = router;