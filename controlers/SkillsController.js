const { Users, Skills } = require('../models');

const addSkills = async (req, res) => {
  try {
    const { skill, percent, type, userId } = req.body;
    const createdSkill = await Skills.create({
      skill,
      percent,
      type,
      userId,
    });

    return res.send(createdSkill);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong' });
  }
};

const getUserSkilles = async (req, res) => {
  try {
    const { id } = req.params;
    const skills = await Skills.findAll({
      where: {
        userId: id,
      },
    });
    return res.send(skills);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Someting went wrong .' });
  }
};

const updateUserSkilles = async (req, res) => {
  try {
    const { skill, percent, type, userId } = req.body;

    const updatedSkills = await Skills.update(
      { skill, percent, type },
      { where: { userId: userId } },
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const destroyUserSkill = async (req, res) => {
  try {
    const { userId, id } = req.query;

    const userSkill = await Skills.findOne({ where: { id: id, userId: userId } });

    if (!userSkill) {
      return res.status(404).json({ message: 'Skill not found for this user' });
    }

    await Skills.destroy({ where: { id: id, userId: userId } });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

module.exports = {
  addSkills,
  getUserSkilles,
  updateUserSkilles,
  destroyUserSkill,
};
