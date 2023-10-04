const { Homework, Users, UserHomework, UserCourses } = require("../models");

const create = async (req, res) => {
  try {
    const {
      courseId,
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      maxPoints,
    } = req.body;

    let homework = await Homework.create({
      courseId,
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      maxPoints,
    });

    let userCourses = await UserCourses.findAll({
      where: { GroupCourseId: courseId },
    });

    userCourses.forEach((user) => {
      UserHomework.create({
        UserId: user.UserId,
        GroupCourseId: courseId,
        HomeworkId: homework.id,
      });
    });

    req.io.emit("new-message", "Hello World!");

    res.send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getHomeworks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { language } = req.query;
    const { user_id: userId } = req.user;

    let homeworks = await UserHomework.findAll({
      where: { GroupCourseId: courseId, UserId: userId },
      include: [
        {
          model: Homework,
          attributes: [
            "id",
            "courseId",
            [`title_${language}`, "title"],
            [`description_${language}`, "description"],
            "maxPoints",
          ],
        },
      ],
    });

    if (!homeworks.length) {
      return res.status(403).json({
        message: "Homeworks not found or User doesn't have the homeworks",
      });
    }

    homeworks = homeworks.map((homework) => {
      return {
        points: homework.points,
        ...homework.dataValues.Homework.dataValues,
      };
    });

    res.send(homeworks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;
    const { language } = req.query;

    let homework = await UserHomework.findOne({
      where: { HomeworkId: id, UserId: userId },
      attributes: ["points"],
      include: [
        {
          model: Homework,
          attributes: [
            "id",
            "courseId",
            [`title_${language}`, "title"],
            [`description_${language}`, "description"],
            "maxPoints",
          ],
        },
      ],
    });

    if (!homework) {
      return res.status(403).json({
        message: "Homework not found or User doesn't have a homework",
      });
    }

    homework = {
      points: homework.points,
      ...homework.dataValues.Homework.dataValues,
    };

    res.send(homework);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  create,
  getHomeworks,
  getHomework,
};
