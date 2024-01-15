var express = require("express");
var router = express.Router();

const controller = require("../controlers/HomeworkController");
const checkAuth = require("../middleware/checkAuth");

router.post("/create", checkAuth(["TEACHER", "ADMIN"]), controller.create);
router.post("/open", checkAuth(["TEACHER", "ADMIN"]), controller.open);

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
router.get(
  "/getHomeworkForTeacher/:id",
  checkAuth(["TEACHER"]),
  controller.getHomeWorkForTeacher
);
router.post(
  "/submitHomework/:id",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.submitHomework
);
router.post(
  "/HomeworkInProgress/:id",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.HomeworkInProgress
);
router.post(
  "/HomeworkFeedback/:id",
  checkAuth(["TEACHER", "ADMIN"]),
  controller.HomeworkFeedback
);
router.patch(
  "/priceHomeWork/:id",
  checkAuth(["TEACHER", "ADMIN"]),
  controller.priceHomeWork
);


module.exports = router;
