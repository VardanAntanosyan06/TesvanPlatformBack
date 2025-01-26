const express = require("express");
const router = express.Router();
const FAQController = require('../controlers/FAQController');

// Routes for careers
router.post('/', FAQController.createFAQ);
router.get('/', FAQController.getAllFAQs);
router.get('/:id', FAQController.getFAQById);
router.put('/:id', FAQController.updateFAQ);
router.delete('/:id', FAQController.deleteFAQ);

module.exports = router;
