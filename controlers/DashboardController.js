const { Users, Groups } = require('../models');

const getUserStatictis = async (req, res) => {
  try {
    const { id } = req.params;
    const statics = await Users.findAll({
      where: {
        id,
      },
      include: [
        {
          model: Groups,
          as: 'groups',
        },
      ],
    });
    return res.json(statics);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Something Went Wrong' });
  }
};

module.exports = {
  getUserStatictis,
};
