var express = require('express');
var router = express.Router();

const controller = require('../controlers/GroupController');
const checkAuth = require('../middleware/checkAuth');

router.post('/create', checkAuth(['ADMIN', 'TEACHER']), controller.CreateGroup);
router.post('/addMember', checkAuth(['ADMIN', 'TEACHER']), controller.addMember);
router.post(
  '/recordUserStatics',
  checkAuth(['TEACHER', 'ADMIN', 'STUDENT']),
  controller.recordUserStatics,
);

router.get('/findOne/:id', controller.findOne);
router.get('/findOneTeacher/:id', checkAuth(['ADMIN', 'TEACHER']), controller.findOneTeacherAdmin);
router.get('/getStudents', checkAuth(['ADMIN']), controller.getStudents);
router.get('/getTeachers', checkAuth(['ADMIN', "TEACHER"]), controller.getTeachers);

router.get(
  '/getUserStaticChart/:groupId',
  checkAuth(['TEACHER', 'ADMIN']),
  controller.getUserStaticChart,
);
router.get('/findAll', checkAuth(['TEACHER', 'ADMIN', 'STUDENT']), controller.findAll);
router.get('/findGroups', checkAuth(['TEACHER', 'ADMIN', 'STUDENT']), controller.findGroups);
router.get('/getAllGroupForTeacher', checkAuth(['TEACHER']), controller.getAllGroupForTeacher);
router.get('/getUsers/:id', checkAuth(['TEACHER', 'ADMIN']), controller.getUsers);
router.get('/singleUserStatic', checkAuth(['TEACHER', 'ADMIN']), controller.SingleUserStatics);
router.get(
  '/getGroupesForTeacher',
  checkAuth(['TEACHER', 'ADMIN']),
  controller.getGroupesForTeacher,
);

router.put('/update/:groupId', checkAuth(['ADMIN', 'TEACHER']), controller.update);
router.patch('/finishGroup/:id', checkAuth(['TEACHER', 'ADMIN']), controller.finishGroup);

router.delete('/deleteMember', checkAuth(['ADMIN', 'TEACHER']), controller.deleteMember);
router.delete('/delete/:id', checkAuth(['ADMIN', 'TEACHER']), controller.deleteGroup);
router.get('/groupInfo/:id', checkAuth(['TEACHER', 'ADMIN']), controller.groupInfo)
router.get('/getAllAdmin', checkAuth(['ADMIN']), controller.getAllAdmin);
router.get('/getAllGroupForSuperAdminDashbord', checkAuth(['SUPERADMIN']), controller.getAllGroupForSuperAdminDashbord);
router.get('/getAllGroupForAdminDashbord', checkAuth(['SUPERADMIN']), controller.getAllGroupForAdminDashbord);

module.exports = router