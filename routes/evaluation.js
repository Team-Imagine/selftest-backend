var express = require("express");
var router = express.Router();

/* GET evaluaions listing. */
router.get("/", function (req, res, next) {
    res.send("respond with a resource");
  });
  
  router.get("/difficulty", function (req, res, next) {
    res.send("/evaluation/difficulty");
  });
  
  router.get("/evalutable_entity", function (req, res, next) {
    res.send("/test/question");
  });
  
  router.get("/test_question", function (req, res, next) {
    res.send("/test/test_question");
  });
  
  router.get("/test_set", function (req, res, next) {
    res.send("/test/test_set");
  });

module.exports = router;