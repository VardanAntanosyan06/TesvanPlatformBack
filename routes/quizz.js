var express = require("express");
var router = express.Router();

const controller = require("../controlers/QuizzController");
const checkAuth = require("../middleware/checkAuth");

router.post("/createQuizz", checkAuth(["TEACHER", "ADMIN"]), controller.createQuizz);
router.get("/getQuizzes/:id", controller.getQuizzes);
router.post("/submitQuizz", checkAuth(["STUDENT","TEACHER", "ADMIN"]), controller.submitQuizz);
router.post("/finishQuizz/:quizzId", checkAuth(["STUDENT","TEACHER", "ADMIN"]), controller.finishQuizz);

module.exports = router;
