var express = require("express");
var router = express.Router();

const controller = require("../controlers/CoursesController");
const checkAuth = require("../middleware/checkAuth");

router.get("/getAll", controller.getAllCourses);
router.get("/getByFilter", controller.getCoursesByLFilter);
router.get("/getOne/:id", controller.getOne);
router.post("/like", checkAuth, controller.like);

module.exports = router;
