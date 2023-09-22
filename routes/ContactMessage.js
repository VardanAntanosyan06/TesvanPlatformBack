var express = require('express');
var router = express.Router();

const controller = require('../controlers/ContactMessagesController');

router.post('/create', controller.create);

module.exports = router;
