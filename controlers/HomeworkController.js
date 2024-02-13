const { invalid } = require("moment");
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
const Sequelize = require("sequelize");

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
// add notification

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

    let userSocket;
    if (!homeWork.isOpen) {
      await Promise.all(
        userCourses.map(async (user) => {
          try {
            // Using await to wait for the findOrCreate operation to complete
            await UserHomework.findOrCreate({
              where: {
                UserId: user.UserId,
                GroupCourseId: courseId,
                HomeworkId: homeworkId,
              },
              defaults: {
                UserId: user.UserId,
                GroupCourseId: courseId,
                HomeworkId: homeworkId,
              },
            });
          } catch (error) {
            console.error(error);
          }
        })
      );
    } else {
      await Promise.all(
        userCourses.map(async (user) => {
          try {
            // Using await to wait for the findOrCreate operation to complete
            await UserHomework.destroy({
              where: {
                UserId: user.UserId,
                GroupCourseId: courseId,
                HomeworkId: homeworkId,
              },
            });
          } catch (error) {
            console.error(error);
          }
        })
      );
    }
    homeWork.isOpen = !homeWork.isOpen;
    await homeWork.save();
    res.send({ success: true, isOpen: !homeWork.isOpen });
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
    console.log(role);
    if (role == "TEACHER") {
      let homeworks = await GroupCourses.findAll({
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
      if (homeworks.length === 0) {
        return res.status(403).json({
          message: "Homeworks not found or User doesn't have the homeworks",
        });
      }
      res.json(homeworks);
    } else if (role == "ADMIN") {
      let homeworks = await GroupCourses.findAll({
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
      if (homeworks.length === 0) {
        return res.status(403).json({
          message: "Homeworks not found or User doesn't have the homeworks",
        });
      }
      res.json(homeworks);
    } else {
      let homeworks = await UserHomework.findAll({
        where: { GroupCourseId: courseId, UserId: userId },
        // attributes: ["],
        attributes: ["id", "points", "status"],
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
            order: [["id", "DESC"]],
          },
        ],
      });

      homeworks = homeworks.map((e) => {
        e = e.toJSON();
        delete e.dataValues;
        e["courseId"] = e.Homework.courseId;
        e["id"] = e.Homework.id;
        e["title"] = e.Homework.title;
        e["description"] = e.Homework.description;
        e["maxPoints"] = e.Homework.maxPoints;
        e["dueDate"] = e.Homework.dueDate;
        delete e.Homework;
        return e;
      });

      if (homeworks.length === 0) {
        return res.status(403).json({
          message: "Homeworks not found or User doesn't have the homeworks",
        });
      }
      res.json([{ GroupCourseId: courseId, Homework: homeworks }]);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// add startDate for user homework and course and homeWorkInprogress add in this  
const getHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId, role } = req.user;
    const { language } = req.query;
    console.log(userId);
    let homework = await UserHomework.findOne({
      where: { HomeworkId: id, UserId: userId },
      attributes: ["points", "status", "answer","feedback"],
      include: [
        {
          model: Homework,
          attributes: [
            "id",
            "courseId",
            [`title_${language}`, "title"],
            [`description_${language}`, "description"],
            "maxPoints",
            "dueDate",
          ],
        },
      ],
    });

    if (!homework) {
      return res.status(403).json({
        message: "Homework not found or User doesn't have a homework",
      });
    }
    // return res.json(homework)
    const Files = await HomeWorkFiles.findAll({
      where: { userId, homeWorkId: homework.Homework.id },
    });

    homework = {
      points: homework.points,
      status: homework.status,
      answer: homework.answer,
      feedback: homework.feedback,
      ...homework.dataValues.Homework.dataValues,
      Files,
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

    Promise.all(
      answer.links.map(async (e) => {
        await HomeWorkFiles.create({
          fileName: e.name,
          fileLink: e.link,
          homeWorkId: id,
          userId,
        });
        // e['name'] = e.name;
        return e;
      })
    );

    homework = {
      ...homework.dataValues,
      answer,
    };
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

    if (homework.startDate) return res.status(403).json({ success: false });
    homework.status = 1;
    homework.startDate = new Date().toISOString();
    await homework.save();
    res.json({ success: true });
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
    const { filterType } = req.query;

    let users = await UserHomework.findAll({
      where: { HomeworkId: id },
      attributes: ["startDate", "points", "status"],
      include: [{ model: Users, attributes: ["firstName", "lastName", "id"] }],
    });
    users = users.map((e) => {
      e = e.toJSON();
      delete e.dataValues;
      e["firstName"] = e.User.firstName;
      e["lastName"] = e.User.lastName;
      e["userId"] = e.User.id;

      delete e.User;
      return e;
    });
    const homeWorkInfo = await Homework.findOne({
      where: { id },
      attributes: [
        "id",
        "courseId",
        ["title_en", "title"],
        ["description_en", "description"],
        "maxPoints",
        "isOpen",
        "dueDate",
      ],
    });
    if (!users) {
      return res.status(403).json({
        message: "Homework not found or Teacher doesn't have the homeworks",
      });
    }

    res.json({ homeWorkInfo, users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getHomeWorkForTeacherForSingleUser = async (req, res) => {
  try {
    const { id, userId } = req.query;

    let user = await UserHomework.findOne({
      where: { HomeworkId: id, UserId: userId },
      attributes: ["startDate", "points", "status", "answer", "feedback"],
      include: [{ model: Users, attributes: ["firstName", "lastName", "id"] }],
    });
    if (!user)
      return res
        .status(403)
        .json({ success: false, message: "Invalid userId" });
    const Files = await HomeWorkFiles.findAll({
      where: { userId, homeWorkId: id },
    });
    user = user.toJSON();
    delete user.dataValues;
    user["firstName"] = user.User.firstName;
    user["lastName"] = user.User.lastName;
    user["userId"] = user.User.id;
    user["files"] = Files;
    delete user.User;

    let homeWorkInfo = await Homework.findOne({
      where: { id },
      attributes: [
        "id",
        "courseId",
        ["title_en", "title"],
        ["description_en", "description"],
        "maxPoints",
        "isOpen",
        "dueDate",
      ],
    });

    if (!user) {
      return res.status(403).json({
        message: "Homework not found or Teacher doesn't have the homeworks",
      });
    }

    res.json({ homeWorkInfo, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    let deleted = await HomeWorkFiles.destroy({ where: { id } });

    if (!deleted)
      return res
        .status(403)
        .json({ success: false, message: `In ID ${id} nothing is found.` });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const priceHomeWork = async (req, res) => {
  try {
    const { id } = req.params;
    const { points } = req.body;
    let [status] = await UserHomework.update(
      { points },
      { where: { HomeworkId: id } }
    );

    if (status === 0) {
      return res.status(403).json({
        message: "Homework not found",
      });
    }
    res.send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  create,
  open,
  getHomeworks,
  getHomework,
  submitHomework,
  getHomeWorkForTeacher,
  HomeworkInProgress,
  HomeworkFeedback,
  priceHomeWork,
  getHomeWorkForTeacherForSingleUser,
  deleteFile,
};
