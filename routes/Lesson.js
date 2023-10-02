var express = require("express");
var router = express.Router();

const controller = require("../controlers/LessonController");
const checkAuth = require("../middleware/checkAuth");

router.get("/getLessons/:courseId", checkAuth, controller.getLessons);
router.get("/getLesson/:id", checkAuth, controller.getLesson);
router.post("/submitQuizz/:id", checkAuth, controller.submitQuizz);

module.exports = router;
