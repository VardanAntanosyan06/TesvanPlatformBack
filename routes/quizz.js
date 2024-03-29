var express = require("express");
var router = express.Router();

const controller = require("../controlers/QuizzController");
const checkAuth = require("../middleware/checkAuth");

router.post("/createQuizz", checkAuth(["TEACHER", "ADMIN"]), controller.createQuizz);
router.get("/getAll", checkAuth(["TEACHER", "ADMIN"]), controller.getAll);

router.get("/getQuizzes/:id",  checkAuth(["STUDENT","TEACHER", "ADMIN"]),controller.getQuizzes);
router.post("/submitQuizz", checkAuth(["STUDENT","TEACHER", "ADMIN"]), controller.submitQuizz);
router.post("/finishQuizz/:quizzId", checkAuth(["STUDENT","TEACHER", "ADMIN"]), controller.finishQuizz);

router.delete("/delete/:id", checkAuth(["ADMIN"]), controller.deleteQuizz);
router.put("/update", checkAuth(["ADMIN"]), controller.updateQuizz);

module.exports = router;
