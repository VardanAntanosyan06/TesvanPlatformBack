var express = require("express");
var router = express.Router();

const controller = require("../controlers/HomeworkController");
const checkAuth = require("../middleware/checkAuth");

router.post("/create", checkAuth, controller.create); // Teacher or Admin
router.get("/getHomeworks/:courseId", checkAuth, controller.getHomeworks);
router.get("/getHomework/:id", checkAuth, controller.getHomework);
router.post("/submitHomework/:id", checkAuth, controller.submitHomework);

module.exports = router;
