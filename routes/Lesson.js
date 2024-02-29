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
  "/getLessonTitles",
  controller.getLessonTitles
);
router.get(
  "/getLesson/:id",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getLesson
);
router.post(
  "/createLesson",
  checkAuth(["TEACHER", "ADMIN"]),
  controller.createLesson
);

router.post(
  "/submitQuizz/:id",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.submitQuizz
);
router.patch(
  "/openLesson/",
  checkAuth(["TEACHER", "ADMIN"]),
  controller.openLesson
);
module.exports = router;
