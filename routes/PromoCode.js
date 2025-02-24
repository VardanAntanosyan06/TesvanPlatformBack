const express = require('express');
const router = express.Router();

const controller = require('../controlers/PromoCodeController');
const checkAuth = require('../middleware/checkAuth');

router.post('/addMemberGroup', checkAuth(['STUDENT']), controller.addMemberGroup);
router.post('/createPromoCodeGroup', checkAuth(['ADMIN']), controller.createPromoCodeGroup);
router.get('/getPromoCodeGroup', checkAuth(['ADMIN']), controller.getPromoCodeGroup);

module.exports = router;