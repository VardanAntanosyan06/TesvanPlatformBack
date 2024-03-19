var express = require('express');
var router = express.Router();

const controller = require('../controlers/TestsController');
const checkAuth = require('../middleware/checkAuth');

router.post('/create', controller.createTest);

module.exports = router;
