const { Career } = require('../models');

// Create a new career
const createCareer = async (req, res) => {
  try {
    const career = await Career.create(req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error creating career.' });
  }
};

// Get all careers with dynamic language support
const getAllCareers = async (req, res) => {
  try {
    const { language } = req.query;

    const careers = await Career.findAll({
      attributes: [
        'id',
        [`title_${language}`, 'title'],
        [`description_${language}`, 'description'],
        'term',
        'type',
        'location',
      ],
      order: [['id', 'DESC']],
    });

    return res.status(200).json({ success: true, careers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching careers.' });
  }
};

// Get a single career by ID
const getCareerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;

    const career = await Career.findByPk(id, {
      attributes: [
        'id',
        [`title_${language}`, 'title'],
        [`description_${language}`, 'description'],
        'term',
        'type',
        'location',
      ],
    });

    if (!career) {
      return res.status(404).json({ message: 'Career not found.' });
    }

    return res.status(200).json({ success: true, career });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching career.' });
  }
};

// Update a career by ID
const updateCareer = async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await Career.update(req.body, {
      where: { id },
    });

    if (!updated) {
      return res.status(404).json({ message: 'Career not found.' });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error updating career.' });
  }
};

// Delete a career by ID
const deleteCareer = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Career.destroy({
      where: { id },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Career not found.' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting career.' });
  }
};

module.exports = {
  createCareer,
  getAllCareers,
  getCareerById,
  updateCareer,
  deleteCareer,
};
