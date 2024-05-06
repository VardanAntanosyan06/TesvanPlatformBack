const { invalid } = require('moment');
const {
  Homework,
  UserHomework,
  UserCourses,
  Message,
  GroupCourses,
  Users,
  HomeWorkFiles,
  HomeworkPerLesson,
} = require('../models');
const { userSockets } = require('../userSockets');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');

const create = async (req, res) => {
  try {
    const { title_en, title_ru, title_am, description_en, description_ru, description_am } =
      req.body;

    await Homework.create({
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
    });
    return res.send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
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
      return res.status(404).json('HomeWork not found');
    }
    if (!homeWork.isOpen) {
      await Promise.all(
        userCourses.map(async (user) => {
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
          Message.create({
            UserId: user.UserId,
            title_en: 'New Homework',
            title_ru: 'New Homework',
            title_am: 'New Homework',
            description_en: 'You have a new homework!',
            description_ru: 'You have a new homework!',
            description_am: 'You have a new homework!',
            type: 'info',
          });
          const userSocket = userSockets.get(user.UserId);
          if (userSocket) {
            userSocket.emit('new-message', 'New Message');
          }
        }),
      );
      homeWork.startDate = new Date().toISOString();
    } else {
      await Promise.all(
        userCourses.map(async (user) => {
          try {
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
        }),
      );
      homeWork.startDate = null;
    }
    homeWork.isOpen = !homeWork.isOpen;
    await homeWork.save();
    res.send({ success: true, isOpen: homeWork.isOpen });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

//  bug + chnage groupId
const getHomeworks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { language } = req.query;
    const { user_id: userId, role } = req.user;
    console.log(role);
    if (role == 'TEACHER') {
      let homeworks = await GroupCourses.findAll({
        where: {
          trainers: {
            [Op.contains]: [userId],
          },
        },
        attributes: [['id', 'GroupCourseId']],
        include: [
          {
            model: Homework,
            attributes: [
              'id',
              'courseId',
              [`title_${language}`, 'title'],
              [`description_${language}`, 'description'],
              'maxPoints',
              'isOpen',
              'dueDate',
              'startDate',
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
    } else if (role == 'ADMIN') {
      let homeworks = await GroupCourses.findAll({
        attributes: [['id', 'GroupCourseId']],
        include: [
          {
            model: Homework,
            attributes: [
              'id',
              'courseId',
              [`title_${language}`, 'title'],
              [`description_${language}`, 'description'],
              'maxPoints',
              'isOpen',
              'dueDate',
              'startDate',
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
        attributes: ['id', 'points', 'status'],
        include: [
          {
            model: Homework,
            attributes: [
              'id',
              'courseId',
              [`title_${language}`, 'title'],
              [`description_${language}`, 'description'],
              'maxPoints',
              'isOpen',
              'dueDate',
              'startDate',
            ],
            order: [['id', 'DESC']],
          },
        ],
      });

      homeworks = homeworks.map((e) => {
        e = e.toJSON();
        delete e.dataValues;
        e['courseId'] = e.Homework.courseId;
        e['id'] = e.Homework.id;
        e['title'] = e.Homework.title;
        e['description'] = e.Homework.description;
        e['maxPoints'] = e.Homework.maxPoints;
        e['dueDate'] = e.Homework.dueDate;
        e['startDate'] = e.Homework.startDate;
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
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId, role } = req.user;
    const { language } = req.query;
    let homework = await Homework.findOne({
      where: { id },
      // attributes: ["id","points", "status", "answer", "feedback","startDate"],
      // include: [
      // {
      // model: Homework,
      attributes: [
        'id',
        // 'courseId',
        [`title_${language}`, 'title'],
        [`description_${language}`, 'description'],
        // 'maxPoints',
        // 'dueDate',
        // 'startDate',
      ],
      // },
      // ],
    });

    if (!homework) {
      return res.status(403).json({
        message: "Homework not found or User doesn't have a homework",
      });
    }
    // return res.status(403).json({homework})

    // if (!homework.startDate) {
    // homework.startDate = new Date().toISOString();
    // homework.status = 1;
    // await homework.save();
    // }

    // const Files = await HomeWorkFiles.findAll({
    //   where: { userId, homeWorkId: homework.Homework.id },
    //   attributes: ['id', ['fileName', 'name'], ['fileLink', 'link']],
    // });

    // homework = {
    //   points: homework.points,
    //   status: homework.status,
    //   answer: homework.answer,
    //   feedback: homework.feedback,
    //   UserStartDate: homework.startDate,
    //   startDate: homework.Homework.startDate,
    //   ...homework.dataValues.Homework.dataValues,
    //   Files,
    // };

    res.send(homework);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
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
      }),
    );

    homework = {
      ...homework.dataValues,
      answer,
    };
    res.send(homework);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};
// ///////////////////////////////////////////////////
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
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};
/////////////////////////////////////////////////
const HomeworkFeedback = async (req, res) => {
  try {
    const { id, userId, feedback } = req.body;
    let homework = await UserHomework.findOne({
      where: { HomeworkId: id, UserId: userId },
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
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getHomeWorkForTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;
    const { filterType } = req.query;

    let users = await UserHomework.findAll({
      where: { HomeworkId: id },
      attributes: ['startDate', 'points', 'status'],
      include: [{ model: Users, attributes: ['firstName', 'lastName', 'id'] }],
    });
    users = users.map((e) => {
      e = e.toJSON();
      delete e.dataValues;
      e['firstName'] = e.User.firstName;
      e['lastName'] = e.User.lastName;
      e['userId'] = e.User.id;

      delete e.User;
      return e;
    });
    const homeWorkInfo = await Homework.findOne({
      where: { id },
      attributes: [
        'id',
        'courseId',
        ['title_en', 'title'],
        ['description_en', 'description'],
        'maxPoints',
        'isOpen',
        'dueDate',
        'startDate',
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
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getHomeWorkForTeacherForSingleUser = async (req, res) => {
  try {
    const { id, userId } = req.query;

    let user = await UserHomework.findOne({
      where: { HomeworkId: id, UserId: userId },
      attributes: ['startDate', 'points', 'status', 'answer', 'feedback'],
      include: [{ model: Users, attributes: ['firstName', 'lastName', 'id'] }],
    });
    if (!user) return res.status(403).json({ success: false, message: 'Invalid userId' });
    const Files = await HomeWorkFiles.findAll({
      where: { userId, homeWorkId: id },
    });
    user = user.toJSON();
    delete user.dataValues;
    user['firstName'] = user.User.firstName;
    user['lastName'] = user.User.lastName;
    user['userId'] = user.User.id;
    user['files'] = Files;
    delete user.User;

    let homeWorkInfo = await Homework.findOne({
      where: { id },
      attributes: [
        'id',
        'courseId',
        ['title_en', 'title'],
        ['description_en', 'description'],
        'maxPoints',
        'isOpen',
        'dueDate',
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
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    let deleted = await HomeWorkFiles.destroy({ where: { id } });

    if (!deleted)
      return res.status(403).json({ success: false, message: `In ID ${id} nothing is found.` });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const priceHomeWork = async (req, res) => {
  try {
    const { points, id, userId } = req.body;
    let [status] = await UserHomework.update(
      { points },
      { where: { HomeworkId: id, UserId: userId } },
    );

    if (status === 0) {
      return res.status(403).json({
        message: 'Homework not found',
      });
    }
    res.send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getHomeworkTitles = async (req, res) => {
  try {
    const homeworks = await Homework.findAll({
      attributes: ['id', ['title_en', 'title']],
    });

    return res.json(homeworks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const homeworkPoints = async (req, res) => {
  try {
    const { userId, homeworkId, points,feedback } = req.body;
    const [status] = await UserHomework.update(
      {
        points,
        feedback
      },
      {
        where: {
          UserId:userId,
          HomeworkId: homeworkId,
          
        },
      },
    );
    if (status === 0) {
      return res.status(403).json({
        message: 'Homework not found',
      });
    }
    return res.json({ success:true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
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
  getHomeworkTitles,
  homeworkPoints,
};
