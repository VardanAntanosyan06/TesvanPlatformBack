var express = require('express');
var router = express.Router();

const controller = require('../controlers/DashboardController');
const checkAuth = require('../middleware/checkAuth');

router.get('/getStatics/:id', checkAuth(['STUDENT', 'TEACHER']), controller.getUserStatictis);
router.get(
  '/getIndividualStatics',
  checkAuth(['STUDENT', 'TEACHER']),
  controller.getInvidualCourseStatics,
);

router.get('/getAdminStatistics', checkAuth(['ADMIN']), controller.getAdminStatistics);

router.get('/getSuperAdminStatistics', checkAuth(['SUPERADMIN']), controller.getSuperAdminStatistics);

module.exports = router;
