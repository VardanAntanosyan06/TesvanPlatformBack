var express = require('express');
var router = express.Router();

const controller = require('../controlers/HomeworkController');
const checkAuth = require('../middleware/checkAuth');
const { userSockets } = require('../userSockets');

router.post('/create', checkAuth(['TEACHER', 'ADMIN']), controller.create);
router.post('/open', checkAuth(['TEACHER', 'ADMIN']), controller.open);

router.get(
  '/getHomeworks/:courseId',
  checkAuth(['STUDENT', 'TEACHER', 'ADMIN']),
  controller.getHomeworks,
);

router.get('/titles', checkAuth(['TEACHER', 'ADMIN']), controller.getHomeworkTitles);
router.get('/getHomework/:id', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), controller.getHomework);
router.get(
  '/getHomeworkForTeacher/:id',
  checkAuth(['TEACHER', 'ADMIN']),
  controller.getHomeWorkForTeacher,
);
router.get(
  '/getHomeWorkForTeacherForSingleUser',
  checkAuth(['TEACHER', 'ADMIN']),
  controller.getHomeWorkForTeacherForSingleUser,
);
router.post(
  '/submitHomework/:id',
  checkAuth(['STUDENT', 'TEACHER', 'ADMIN']),
  controller.submitHomework,
);
router.post(
  '/HomeworkInProgress/:id',
  checkAuth(['STUDENT', 'TEACHER', 'ADMIN']),
  controller.HomeworkInProgress,
);
router.patch('/HomeworkFeedback/', checkAuth(['TEACHER', 'ADMIN']), controller.HomeworkFeedback);
router.patch('/priceHomeWork/', checkAuth(['TEACHER', 'ADMIN']), controller.priceHomeWork);
router.post('/test/', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), (req, res) => {
  const { user_id: userId } = req.user;
  const userSocket = userSockets.get(userId);
  if (userSocket) {
    userSocket.emit('new-message', '!!!!!!!!!!!!!!!!!!!!!!!!');
  }
  return res.send({ success: true });
});

router.delete('/deleteFile/:id', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), controller.deleteFile);
router.put('/addPoint', controller.homeworkPoints);
router.get(
  '/getHomeworkPoints/:courseId',
  checkAuth(['TEACHER', 'ADMIN']),
  controller.getUserHomeworkPoints,
);

router.put('/updateHomework/:homeworkId', checkAuth(['TEACHER', 'ADMIN']), controller.updateHomework)
router.delete('/deleteHomework/:homeworkId', checkAuth(['TEACHER', 'ADMIN']), controller.deleteHomework)

module.exports = router;
