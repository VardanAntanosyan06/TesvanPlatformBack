var express = require("express");
var router = express.Router();

const controller = require("../controlers/HomeworkController");
const checkAuth = require("../middleware/checkAuth");

router.post("/create", checkAuth, controller.create);
router.get("/getHomeworks/:courseId", checkAuth, controller.getHomeworks);
router.get("/getHomework/:id", checkAuth, controller.getHomework);

module.exports = router;
