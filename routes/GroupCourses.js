var express = require('express');
var router = express.Router();

const controller = require('../controlers/CoursesController');
const checkAuth = require('../middleware/checkAuth');

router.get('/getAll', controller.getAllCourses);
router.get('/getCourseTitles', controller.getCourseTitles);
router.get('/getOneGroup/', controller.getOneGroup);

router.get('/getByFilter', controller.getCoursesByFilter);

router.post('/createCourse', checkAuth(['TEACHER', 'ADMIN']), controller.createCourse);
router.get('/individualGetOne/:id', controller.IndividualGetOne);

router.get('/getCourseForAdmin/:id', checkAuth(['ADMIN']), controller.getCourseForAdmin);

router.get('/getOne/:id', controller.getOne);
router.get('/like/:courseId',   checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), controller.like);
// router.get('/buy/:groupId', checkAuth(['STUDENT']), controller.buy);
router.get(
  '/getUserCourses',
  checkAuth(['ADMIN', 'TEACHER', 'STUDENT']),
  controller.getUserCourses,
);
router.get(
  '/getUserCourse/:courseId',
  checkAuth(['STUDENT', 'TEACHER', 'ADMIN']),
  controller.getUserCourse,
);

router.post('/createTest/', checkAuth(['STUDENT']), controller.createTest);

router.delete('/delete/:id', checkAuth(['ADMIN']), controller.deleteCourse);
router.put('/update/:courseId', checkAuth(['ADMIN']), controller.updateCourse);

module.exports = router;
