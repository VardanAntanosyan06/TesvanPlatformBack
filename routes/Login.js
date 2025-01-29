var express = require('express');
var router = express.Router();

const controller = require('../controlers/LoginController');
const checkAuth = require('../middleware/checkAuth');
const checkAuthAdminPayment = require("../middleware/checkAuthAdminPayment")

router.post('/Login', controller.LoginUsers);
router.get('/ForgotPassword', controller.sendEmailForForgotPassword);
router.patch('/ChangePassword', controller.forgotPassword);
router.post('/ChangeEmail', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), controller.changeEmail);

router.get('/authMe', checkAuthAdminPayment(['STUDENT', 'TEACHER', 'ADMIN', 'SUPERADMIN']), controller.authMe);
router.put('/changeUserData', checkAuth(['STUDENT', 'TEACHER']), controller.changeUserData);
router.patch(
  '/changeUserImage',
  checkAuth(['STUDENT', 'TEACHER', 'ADMIN']),
  controller.changeUserImage,
);
router.patch(
  '/verifyNewEmail',
  checkAuth(['STUDENT', 'TEACHER', 'ADMIN']),
  controller.verifyChangeEmail,
);
router.put(
  '/changePassword',
  checkAuth(['STUDENT', 'TEACHER', 'ADMIN']),
  controller.changePassword,
);

module.exports = router;
