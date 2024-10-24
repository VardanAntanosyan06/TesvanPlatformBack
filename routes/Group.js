var express = require('express');
var router = express.Router();

const controller = require('../controlers/GroupController');
const checkAuth = require('../middleware/checkAuth');

router.post('/create', checkAuth(['ADMIN']), controller.CreateGroup);
router.post('/addMember', checkAuth(['ADMIN']), controller.addMember);
router.post(
  '/recordUserStatics',
  checkAuth(['TEACHER', 'ADMIN', 'STUDENT']),
  controller.recordUserStatics,
);

router.get('/findOne/:id', controller.findOne);
router.get('/findOneTeacher/:id', controller.findOneTeacher);
router.get('/getStudents', checkAuth(['ADMIN']), controller.getStudents);
router.get('/getTeachers', checkAuth(['ADMIN']), controller.getTeachers);

router.get(
  '/getUserStaticChart/:groupId',
  checkAuth(['TEACHER', 'ADMIN']),
  controller.getUserStaticChart,
);
router.get('/findAll', checkAuth(['TEACHER', 'ADMIN', 'STUDENT']), controller.findAll);
router.get('/findGroups', checkAuth(['TEACHER', 'ADMIN', 'STUDENT']), controller.findGroups);
router.get('/getUsers/:id', checkAuth(['TEACHER', 'ADMIN']), controller.getUsers);
router.get('/singleUserStatic', checkAuth(['TEACHER', 'ADMIN']), controller.SingleUserStatics);
router.get(
  '/getGroupesForTeacher',
  checkAuth(['TEACHER', 'ADMIN']),
  controller.getGroupesForTeacher,
);

router.put('/update/:groupId', checkAuth(['ADMIN']), controller.update);
router.patch('/finishGroup/:id', checkAuth(['TEACHER', 'ADMIN']), controller.finishGroup);

router.delete('/deleteMember', checkAuth(['ADMIN']), controller.deleteMember);
router.delete('/delete/:id', checkAuth(['ADMIN']), controller.deleteGroup);
router.get('/groupInfo/:id', checkAuth(['TEACHER', 'ADMIN']), controller.groupInfo)
module.exports = router;
