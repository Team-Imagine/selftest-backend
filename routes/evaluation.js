var express = require("express");
var router = express.Router();

/* GET evaluaions listing. */
router.get("/", function (req, res, next) {
<<<<<<< HEAD
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

=======
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
>>>>>>> routes

module.exports = router;