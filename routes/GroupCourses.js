var express = require("express");
var router = express.Router();

const controller = require("../controlers/CoursesController");
const checkAuth = require("../middleware/checkAuth");

router.get("/getAll", controller.getAllCourses);
router.get("/getByFilter", controller.getCoursesByLFilter);
router.get("/getOne/:id", controller.getOne);
router.get("/like/:courseId", checkAuth, controller.like);
router.get("/buy/:courseId", checkAuth, controller.buy);

module.exports = router;
