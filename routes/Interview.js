var express = require('express');
var router = express.Router();

const controller = require('../controlers/InterviewController');
const checkAuth = require('../middleware/checkAuth');

router.put('/create', checkAuth(['TEACHER', 'ADMIN']), controller.createPoints);

module.exports = router;
