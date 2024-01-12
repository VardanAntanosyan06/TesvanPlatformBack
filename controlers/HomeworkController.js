const {
  Homework,
  UserHomework,
  UserCourses,
  Message,
  GroupCourses,
  Users,
  HomeWorkFiles,
} = require("../models");
const { userSockets } = require("../userSockets");
const { Op } = require("sequelize");

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
      dueDate,
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
      dueDate,
    });

    res.send(homework);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const open = async (req, res) => {
  try {
    const { courseId, homeworkId } = req.query;

    let userCourses = await UserCourses.findAll({
      where: { GroupCourseId: courseId },
    });

    const homeWork = await Homework.findOne({ where: { id: homeworkId } });
    if (!homeWork) {
      return res.status(404).json("HomeWork not found");
    }
    homeWork.isOpen = !homeWork.isOpen;
    await homeWork.save();

    let userSocket;
    userCourses.forEach((user) => {
      UserHomework.findOne({
        where: {
          UserId: user.UserId,
          GroupCourseId: courseId,
          HomeworkId: homeworkId,
        },
      }).then((e) => {
        !e &&
          UserHomework.create({
            UserId: user.UserId,
            GroupCourseId: courseId,
            HomeworkId: homeworkId,
          });
      });
      res.send({ success: true });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getHomeworks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { language } = req.query;
    const { user_id: userId, role } = req.user;
    let homeworks;
    console.log(userId);
    if (role == "TEACHER") {
      homeworks = await GroupCourses.findAll({
        where: {
          trainers: {
            [Op.contains]: [userId],
          },
        },
        attributes: [["id", "GroupCourseId"]],
        include: [
          {
            model: Homework,
            attributes: [
              "id",
              "courseId",
              [`title_${language}`, "title"],
              [`description_${language}`, "description"],
              "maxPoints",
              "isOpen",
              "dueDate",
            ],
            where: { courseId },
          },
        ],
      });
    } else {
      homeworks = await UserHomework.findAll({
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
        order: [["id", "DESC"]],
      });
    }

    if (!homeworks.length) {
      return res.status(403).json({
        message: "Homeworks not found or User doesn't have the homeworks",
      });
    }

    res.send(homeworks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId, role } = req.user;
    const { language } = req.query;
    let homework = await UserHomework.findOne({
      where: { HomeworkId: id, UserId: userId },
      attributes: ["points", "status", "answer"],
      include: [
        {
          model: Homework,
          attributes: [
            "id",
            "courseId",
            [`title_${language}`, "title"],
            [`description_${language}`, "description"],
            "maxPoints",
            "startDate",
            "feedback",
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
      status: homework.status,
      answer: homework.answer,
      ...homework.dataValues.Homework.dataValues,
    };

    res.send(homework);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const submitHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;
    const { answer } = req.body;

    let homework = await UserHomework.findOne({
      where: { HomeworkId: id, UserId: userId },
    });

    if (!homework) {
      return res.status(403).json({
        message: "Homework not found or User doesn't have a homework",
      });
    }

    homework.answer = answer.value;
    homework.status = 2;
    await homework.save();
    console.log(answer);
    Promise.all(
      answer.links.map(async (e) => {
        await HomeWorkFiles.create({
          fileName: e.name,
          fileLink: e.link,
          homeWorkId: id,
          userId,
        });
      })
    );
    res.send(homework);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const HomeworkInProgress = async (req, res) => {
  try {
    const { id } = req.params;
    let homework = await UserHomework.findOne({
      where: { HomeworkId: id },
    });

    if (!homework) {
      return res.status(403).json({
        message: "Homework not found or User doesn't have a homework",
      });
    }

    homework.status = 2;
    homework.startDate = new Date().toISOString();
    await homework.save();
    res.json({success:true});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const HomeworkFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    let homework = await UserHomework.findOne({
      where: { HomeworkId: id },
    });

    if (!homework) {
      return res.status(403).json({
        message: "Homework not found or User doesn't have a homework",
      });
    }

    homework.feedback = feedback;
    await homework.save();
    res.send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getHomeWorkForTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;
    const { language, filterType } = req.query;
    let homework = await GroupCourses.findOne({
      where: {
        trainers: {
          [Op.contains]: [userId],
        },
      },
      attributes: [["id", "GroupCourseId"]],
      include: [
        {
          model: Homework,
          where: { id },
          include: [
            {
              model: UserHomework,
              include: [
                {
                  model: Users,
                  attributes: { exclude: ["password", "token"] },
                },
              ],
              where: { HomeworkId: id },
              order: [["points", `${filterType}`]],
            },
          ],
        },
      ],
    });
    const homeWorkFile = await HomeWorkFiles.findAll({
      attributes: ["fileName", "fileLink", "userId"],
      where: {
        homeWorkId: id,
        userId: homework.Homework[0].UserHomeworks[0].UserId,
      },
    });

    if (!homework) {
      return res.status(403).json({
        message: "Homeworks not found or Teacher doesn't have the homeworks",
      });
    }
    // homework.Homework[0].tets = homeWorkFile;
    // console.log(homework.dataValues);
    const { Homework: homeworkOne, ...data } = homework.dataValues;
    res.send({
      ...data,
      homework: {
        ...homeworkOne[0].dataValues,
        homeWorkFiles: homeWorkFile,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

//start date
//feedback
//is opend

module.exports = {
  create,
  open,
  getHomeworks,
  getHomework,
  submitHomework,
  getHomeWorkForTeacher,
  HomeworkInProgress,
  HomeworkFeedback,
};
