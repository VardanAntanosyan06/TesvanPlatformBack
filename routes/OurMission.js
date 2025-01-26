const express = require('express');
const {
  createDetails,
  getAllDetails,
  getDetailsById,
  updateDetails,
  deleteDetails,
} = require('../controllers/organizationDetails.controller');

const router = express.Router();

// Define routes
router.post('/', createDetails);          // Create a new record
router.get('/', getAllDetails);          // Get all records
router.get('/:id', getDetailsById);      // Get a record by ID
router.put('/:id', updateDetails);       // Update a record by ID
router.delete('/:id', deleteDetails);    // Delete a record by ID

module.exports = router;
