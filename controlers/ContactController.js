const { Contact } = require('../models');

const getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      order: [['id', 'DESC']],
    });

    return res.status(200).json({ success: true, contact });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching careers.' });
  }
};

const updateContact = async (req, res) => {
  try {
    const { tel, mail, location } = req.body
    const contact = await Contact.findOne({
      order: [['id', 'DESC']],
    });

    contact.tel = tel;
    contact.mail = mail;
    contact.location = location;

    await contact.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error updating career.' });
  }
};

module.exports = {
  getContact,
  updateContact,
};
