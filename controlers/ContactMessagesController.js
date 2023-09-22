const { ContactMessage } = require('../models');

const create = async (req, res) => {
  try {
    const { firstName, lastName, email, message, phone } = req.body;
    const contactMessage = await ContactMessage.create({
      firstName,
      lastName,
      email,
      message,
      phone,
    });

    return res.status(200).json(contactMessage);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

module.exports = {
  create,
};
