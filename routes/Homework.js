var express = require("express");
var router = express.Router();

const controller = require("../controlers/HomeworkController");
const checkAuth = require("../middleware/checkAuth");

router.post("/create", checkAuth(["TEACHER", "ADMIN"]), controller.create);
router.get(
  "/getHomeworks/:courseId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getHomeworks
);
router.get(
  "/getHomework/:id",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getHomework
);
router.post(
  "/submitHomework/:id",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.submitHomework
);

module.exports = router;
