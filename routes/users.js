var express = require("express");
var router = express.Router();
const app = express();

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

// users - user - bookmark
router.get("/bookmark/", function (req, res, next) {
  res.send("user's bookmark list");
});

router.get("/bookmark/:id", function (req, res, next) {
  res.send("user " + req.params.id + " bookmark");
});

router.post("/bookmark/:id", function (req, res, next) {
  res.send("new bookmark");
});

router.delete("/bookmark/:id", function (req, res, next) {
  res.send("delete bookmark");
});

// users - user - penalty_log
router.get("/penalty_log", function (req, res, next) {
  res.send("user's penalty_log");
});

router.get("/penalty_log/:id", function (req, res, next) {
  res.send("user " + req.params.id + " penalty_log");
});

router.post("/penalty_log/:id", function (req, res, next) {
  res.send("new penalty_log");
});

router.put("/penalty_log/:id", function (req, res, next) {
  res.send("update penalty_log");
});

router.delete("/penalty_log/:id", function (req, res, next) {
  res.send("delete penalty_log");
});

// users - user - point_log
router.get("/point_log", function (req, res, next) {
  res.send("user's point_log");
});

router.get("/point_log/:id", function (req, res, next) {
  res.send("user " + req.params.id + " point_log");
});

router.post("/point_log/:id", function (req, res, next) {
  res.send("new point_log");
});

router.put("/point_log/:id", function (req, res, next) {
  res.send("update point_log");
});

router.delete("/point_log/:id", function (req, res, next) {
  res.send("delete point_log");
});

module.exports = router;
