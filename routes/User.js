var express = require('express');
var router = express.Router();

const controller = require('../controlers/UserController');
const checkAuth = require('../middleware/checkAuth');

router.put('/deleteAvatar', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), controller.removeAvatar);

module.exports = router;
