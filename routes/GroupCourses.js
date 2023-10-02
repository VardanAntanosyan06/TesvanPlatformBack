var express = require("express");
var router = express.Router();

const controller = require("../controlers/CoursesController");
const checkAuth = require("../middleware/checkAuth");

router.get("/getAll", controller.getAllCourses);
router.get("/getByFilter", controller.getCoursesByFilter);
router.get("/getOne/:id", controller.getOne);
router.get("/like/:courseId", checkAuth, controller.like);
router.get("/buy/:courseId", checkAuth, controller.buy);
router.get("/getUserCourses", checkAuth, controller.getUserCourses);
router.get("/getUserCourse/:courseId", checkAuth, controller.getUserCourse);

module.exports = router;
