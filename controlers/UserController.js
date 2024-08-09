const { Users } = require('../models');

const removeAvatar = async (req, res) => {
  try {
    const { user_id } = req.user;

    await Users.update({ image: "defaultIcon.png" }, { where: { id: user_id } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong' });
  }
};

module.exports = {
  removeAvatar,
};
