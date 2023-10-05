var express = require("express");
var router = express.Router();

const controller = require("../controlers/LessonController");
const checkAuth = require("../middleware/checkAuth");

router.get(
  "/getLessons/:courseId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getLessons
);
router.get(
  "/getLesson/:id",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getLesson
);
router.post(
  "/submitQuizz/:id",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.submitQuizz
);

module.exports = router;
