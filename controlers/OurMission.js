const OrganizationDetails = require('../models/OrganizationDetails');

// Create a new record
const createDetails = async (req, res) => {
  try {
    const details = await OrganizationDetails.create(req.body);
    res.status(201).json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all records
const getAllDetails = async (req, res) => {
  try {
    const details = await OrganizationDetails.findAll();
    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single record by ID
const getDetailsById = async (req, res) => {
  try {
    const details = await OrganizationDetails.findByPk(req.params.id);
    if (!details) {
      return res.status(404).json({ message: 'Details not found' });
    }
    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a record by ID
const updateDetails = async (req, res) => {
  try {
    const details = await OrganizationDetails.findByPk(req.params.id);
    if (!details) {
      return res.status(404).json({ message: 'Details not found' });
    }
    const updatedDetails = await details.update(req.body);
    res.status(200).json(updatedDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a record by ID
const deleteDetails = async (req, res) => {
  try {
    const details = await OrganizationDetails.findByPk(req.params.id);
    if (!details) {
      return res.status(404).json({ message: 'Details not found' });
    }
    await details.destroy();
    res.status(200).json({ message: 'Details deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDetails,
  getAllDetails,
  getDetailsById,
  updateDetails,
  deleteDetails,
};
