const { UserInterview } = require('../models');
const { Op } = require('sequelize');
const calendar = require('../models/calendar');
const createPoints = async (req, res) => {
  try {
    const { userId, interviewId, points } = req.body;

    const finalInterview = await UserInterview.findOne({
      where: {
        calendarId: interviewId,
        userId,
      },
    });

    if (finalInterview) {
      finalInterview.points = points
      await finalInterview.save()
    } else {
      return res.status(400).json({ success: false });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

module.exports = {
  createPoints,
};
