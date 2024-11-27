var express = require('express');
var router = express.Router();

const controller = require('../controlers/QuizzController');
const checkAuth = require('../middleware/checkAuth');

router.post('/createQuizz', checkAuth(['TEACHER', 'ADMIN']), controller.createQuizz);
router.get('/getAll', checkAuth(['TEACHER', 'ADMIN']), controller.getAll);

router.get('/getAllTitleForTeacher', checkAuth(['TEACHER']), controller.getAllTitleForTeacher);

router.post("/getUserAnswers/", checkAuth(["STUDENT", "TEACHER"]), controller.getUserAnswers);
router.get("/getQuizzesAdmin/:id", checkAuth(["ADMIN", "TEACHER"]), controller.getQuizzesAdmin);
router.get("/getQuizzes/:quizzId", checkAuth(["STUDENT", "TEACHER", "ADMIN"]), controller.getQuizzes);
router.post("/submitQuizz", checkAuth(["STUDENT", "TEACHER", "ADMIN"]), controller.submitQuizz);
router.post("/finishQuizz", checkAuth(["STUDENT", "TEACHER", "ADMIN"]), controller.finishQuizz);

router.delete("/delete/:id", checkAuth(["ADMIN", "TEACHER"]), controller.deleteQuizz);
router.put("/update/:id", checkAuth(["ADMIN", "TEACHER"]), controller.updateQuizz);

router.get('/userQuizz/:quizzId', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), controller.getUserQuizzAnswers);



module.exports = router;
