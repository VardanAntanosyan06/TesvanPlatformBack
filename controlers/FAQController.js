const { FAQ } = require('../models');

// Create FAQ
const createFAQ = async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message); // Log the error message
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

// Read All FAQs
const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.findAll({
      attributes: [
        [`question_${language}`, 'question'],
        [`answer_${language}`, 'answer'],
      ],
      order: [['id', 'DESC']],
    });
    res.status(200).json({ success: true, faqs });
  } catch (error) {
    console.log(error.message); // Log the error message
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

// Read Single FAQ
const getFAQById = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;

    const faq = await FAQ.findByPk(id, {
      attributes: [
        [`question_${language}`, 'question'],
        [`answer_${language}`, 'answer'],
      ],
    });
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found.' });
    }

    res.status(200).json({ success: true, faq });
  } catch (error) {
    console.log(error.message); // Log the error message
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

// Update FAQ
const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await FAQ.update(req.body, {
      where: { id },
    });
    if (!updated) {
      return res.status(404).json({ message: 'FAQ not found.' });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message); // Log the error message
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

// Delete FAQ
const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await FAQ.destroy({
      where: { id },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'FAQ not found.' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message); // Log the error message
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

module.exports = {
  createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
};

