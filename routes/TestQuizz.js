var express = require("express");
var router = express.Router();

const controller = require("../controlers/TestsController");
const checkAuth = require("../middleware/checkAuth");

router.post("/create", checkAuth(["TEACHER", "ADMIN"]), controller.createQuizz);
// router.post("/open", checkAuth(["TEACHER", "ADMIN"]), controller.open);

router.get(
  "/findTest/:id",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.findTest
);

// router.get(
//   "/getHomework/:id",
//   checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
//   controller.getHomework
// );
// router.get(
//   "/getHomeworkForTeacher/:id",
//   checkAuth(["TEACHER","ADMIN"]),
//   controller.getHomeWorkForTeacher
// );
// router.get(
//   "/getHomeWorkForTeacherForSingleUser",
//   checkAuth(["TEACHER","ADMIN"]),
//   controller.getHomeWorkForTeacherForSingleUser
// );
// router.post(
//   "/submitHomework/:id",
//   checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
//   controller.submitHomework
// );
// router.post(
//   "/HomeworkInProgress/:id",
//   checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
//   controller.HomeworkInProgress
// );
// router.patch(
//   "/HomeworkFeedback/",
//   checkAuth(["TEACHER", "ADMIN"]),
//   controller.HomeworkFeedback
// );
// router.patch(
//   "/priceHomeWork/",
//   checkAuth(["TEACHER", "ADMIN"]),
//   controller.priceHomeWork
// );

// router.delete(
//   "/deleteFile/:id",
//   checkAuth(["STUDENT","TEACHER", "ADMIN"]),
//   controller.deleteFile
// );

module.exports = router;
