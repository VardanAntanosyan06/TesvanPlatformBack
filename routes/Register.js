var express = require('express');
var router = express.Router();

const controller = require('../controlers/RegisterController');
const checkAuth = require('../middleware/checkAuth');

router.post('/', controller.UserRegistartion);
router.get('/emailExist/:email', controller.EmailExist);
router.get('/sendEmail', controller.UserRegistartionSendEmail);
router.patch('/verification', controller.UserRegistartionVerification);
router.post('/testing', checkAuth(['ADMIN']), controller.RegisterTesting);
router.post('/addUser', checkAuth(['ADMIN']), controller.AddMember);
router.get('/getMembers', checkAuth(['ADMIN']), controller.getMembers);
router.get('/getMember/:id', checkAuth(['ADMIN']), controller.getMember);
router.patch('/changeEmail/', checkAuth(['ADMIN', 'TEACHER', 'STUDENT']), controller.changeEmail);

router.patch('/editMembers/:id', checkAuth(['ADMIN']), controller.editMember);
router.delete('/deleteAccount/', checkAuth(['ADMIN', 'TEACHER', 'STUDENT']), controller.deleteAccount);
router.delete('/deleteMembers/:id', checkAuth(['ADMIN']), controller.deleteMembers);

router.patch('/editAvatar/', checkAuth(['ADMIN', 'TEACHER', 'STUDENT']), controller.editImage);

module.exports = router;
