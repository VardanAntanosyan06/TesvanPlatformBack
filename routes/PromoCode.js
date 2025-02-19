const express = require('express');
const router = express.Router();

const controller = require('../controlers/PromoCodeController');
const checkAuth = require('../middleware/checkAuth');

router.post('/addMemberGroup', checkAuth(['STUDENT']), controller.addMemberGroup);

module.exports = router;