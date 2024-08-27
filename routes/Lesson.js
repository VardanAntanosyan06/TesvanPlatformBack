var express = require('express');
var router = express.Router();

const controller = require('../controlers/LessonController');
const checkAuth = require('../middleware/checkAuth');

router.get(
  '/getLessons/:courseId',
  checkAuth(['STUDENT', 'TEACHER', 'ADMIN']),
  controller.getLessons,
);

router.get('/getLessonTitles', controller.getLessonTitles);

router.get('/getLessonTitles', controller.getLessonTitles);
router.get('/getLesson/:id', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), controller.getLesson);
router.get('/getLessonForAdmin/:id', checkAuth(['ADMIN']), controller.getLessonForAdmin);

router.get('/getLesson/:id', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), controller.getLesson);

router.post('/createLesson', checkAuth(['TEACHER', 'ADMIN']), controller.createLesson);

router.post('/submitQuizz/:id', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), controller.submitQuizz);
router.patch('/openLesson/', checkAuth(['TEACHER', 'ADMIN']), controller.openLesson);

router.put('/update', checkAuth(['ADMIN']), controller.updateLesson);

router.delete('/delete/:id', checkAuth(['ADMIN']), controller.deleteLesson);

router.post(
  '/time/:lessonId',
  checkAuth(['STUDENT', 'TEACHER', 'ADMIN']),
  controller.createLessonTime,
);

router.post(
  '/updateTime/:lessonId',
  checkAuth(['STUDENT', 'TEACHER', 'ADMIN']),
  controller.updateLessonTime,
);
module.exports = router;
