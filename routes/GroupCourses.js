var express = require('express');
var router = express.Router();

const controller = require('../controlers/CoursesController');
const checkAuth = require('../middleware/checkAuth');

router.get('/getAll', controller.getAllCourses);
router.get('/getCourseTitles', controller.getCourseTitles);
router.get('/getOneGroup/:id', controller.getOneGroup);

router.get('/getByFilter', controller.getCoursesByFilter);

router.post('/createCourse', checkAuth(['TEACHER', 'ADMIN']), controller.createCourse);
router.post('/createCourse', controller.createCourse);
router.get('/getCourseForAdmin/:id', checkAuth(['ADMIN']), controller.getCourseForAdmin);

router.get('/getOne/:id', controller.getOne);
router.get('/like/:courseId', checkAuth(['STUDENT']), controller.like);
router.get('/buy/:groupId', checkAuth(['STUDENT']), controller.buy);
router.get('/getUserCourses', checkAuth(['STUDENT','TEACHER']),controller.getUserCourses);
router.get(
  '/getUserCourse/:courseId',
  checkAuth(['STUDENT', 'TEACHER', 'ADMIN']),
  controller.getUserCourse,
);

router.post('/createTest/', checkAuth(['STUDENT']), controller.createTest);

router.delete('/delete/:id', checkAuth(['ADMIN']), controller.deleteCourse);
router.put('/update/:id', checkAuth(['ADMIN']), controller.updateCourse);

module.exports = router;
