var express = require("express");
var router = express.Router();

const controller = require("../controlers/CoursesController");
router.get("/getAll", controller.getAllCourses);

module.exports = router;
