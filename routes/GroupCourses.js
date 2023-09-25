var express = require("express");
var router = express.Router();

const controller = require("../controlers/CoursesController");
router.get("/getAll", controller.getAllCourses);
router.get("/getByFilter", controller.getCoursesByLFilter);
router.get("/getOne/:id", controller.getOne);
router.get("/getLikes", controller.getLikes);
router.post("/like", controller.like);

module.exports = router;
