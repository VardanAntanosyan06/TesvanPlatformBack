var express = require('express');
var router = express.Router();

const controller = require('../controlers/TestsController');
const checkAuth = require('../middleware/checkAuth');

router.post('/create', checkAuth(['TEACHER', 'ADMIN']), controller.createQuizz);
router.get('/getAll', checkAuth(['ADMIN']), controller.findAll);

// router.post("/open", checkAuth(["TEACHER", "ADMIN"]), controller.open);
router.put('/edit/:id', checkAuth(['ADMIN']), controller.updateTest);
router.delete('/delete/:id', checkAuth(['ADMIN']), controller.deleteTest);

router.get('/findTest/:id', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), controller.findTest);

router.post('/submit/', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), controller.submitQuizz);

router.post(
  '/finishCourse/:testId',
  checkAuth(['STUDENT', 'TEACHER', 'ADMIN']),
  controller.finishCourse,
);
router.get('/getUserTests', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), controller.getUserTestsAll);
router.get('/getUsers', checkAuth(['TEACHER', 'ADMIN']), controller.getUsers);
// router.post(
//   "/HomeworkInProgress/:id",
//   checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
//   controller.HomeworkInProgress
// );
// router.patch(
//   "/HomeworkFeedback/",
//   checkAuth(["TEACHER", "ADMIN"]),
//   controller.HomeworkFeedback
// );
// router.patch(
//   "/priceHomeWork/",
//   checkAuth(["TEACHER", "ADMIN"]),
//   controller.priceHomeWork
// );

// router.delete(
//   "/deleteFile/:id",
//   checkAuth(["STUDENT","TEACHER", "ADMIN"]),
//   controller.deleteFile
// );

module.exports = router;
