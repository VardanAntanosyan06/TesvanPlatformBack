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
  checkAuth(["TEACHER","ADMIN"]),
  controller.getHomeWorkForTeacher
);
router.get(
  "/getHomeWorkForTeacherForSingleUser",
  checkAuth(["TEACHER","ADMIN"]),
  controller.getHomeWorkForTeacherForSingleUser
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
router.patch(
  "/HomeworkFeedback/",
  checkAuth(["TEACHER", "ADMIN"]),
  controller.HomeworkFeedback
);
router.patch(
  "/priceHomeWork/",
  checkAuth(["TEACHER", "ADMIN"]),
  controller.priceHomeWork
);

router.delete(
  "/deleteFile/:id",
  checkAuth(["STUDENT","TEACHER", "ADMIN"]),
  controller.deleteFile
);

module.exports = router;
