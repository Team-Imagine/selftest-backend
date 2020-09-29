var express = require("express");
var router = express.Router();

// course
router.get("/", function (req, res, next) {
  res.send("course list");
});

router.get("/:id", function (req, res, next) {
  res.send("course " + req.params.id + " data" );
});
  
router.post("/:id", function (req, res, next) {
  res.send("new course: " + req.params.id);
});
  
router.put("/:id", function (req, res, next) {
  res.send("update course: " + req.params.id);
});
  
router.delete("/:id", function (req, res, next) {
  res.send("delete course: " + req.params.id);
});



module.exports = router;