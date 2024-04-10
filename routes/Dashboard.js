var express = require('express');
var router = express.Router();

const controller = require('../controlers/DashboardController');
const checkAuth = require('../middleware/checkAuth');

router.get('/getStatics/:id', checkAuth(["STUDENT","TEACHER"]),controller.getUserStatictis);

module.exports = router;
