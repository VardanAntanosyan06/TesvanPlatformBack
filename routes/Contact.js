const express = require('express');
const router = express.Router();
const contactController = require('../controlers/ContactController');

// Routes for careers
router.get('/', contactController.getContact);
router.put('/', contactController.updateContact);


module.exports = router;
