const { invalid } = require('moment');
const {
  Homework,
  UserHomework,
  UserCourses,
  Message,
  GroupCourses,
  Users,
  UserLesson,
  Lesson,
  HomeWorkFiles,
  HomeworkPerLesson,
  Groups,
  UserInterview,
} = require('../models');
const { userSockets } = require('../userSockets');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const { assign } = require('nodemailer/lib/shared');

////////////////////////////creator id code off

const create = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { title_en, title_ru, title_am, description_en, description_ru, description_am, point, dueDate } =
      req.body;

    await Homework.create({
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      point,
      creatorId: userId,
      dueDate
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

    const homeWork = await Homework.findOne({
      where: { id: homeworkId },
      include: [{ model: HomeworkPerLesson, attributes: ['lessonId'] }],
    });
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
              LessonId: homeWork.HomeworkPerLesson.lessonId,
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
                LessonId: homeWork.HomeworkPerLesson.lessonId,
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
    const { user_id: userId } = req.user;

    let homeworks = await GroupCourses.findOne({
      where: { id: courseId },
      include: [
        {
          model: Lesson,
          required: true,
          through: { attributes: [] },
          include: [
            {
              model: Homework,
              as: 'homework',
              required: true,
              attributes: [
                'id',
                [`title_${language}`, 'title'],
                [`description_${language}`, 'description'],
                'point',
                'dueDate'
              ],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    homeworks = homeworks.Lessons.reduce((aggr, lesson) => {
      aggr = [...lesson.homework, ...aggr]
      return aggr
    }, [])
    return res.json(homeworks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId, role } = req.user;
    const { language, courseId, lessonId } = req.query;

    await UserHomework.findOrCreate({
      where: { HomeworkId: id, UserId: userId, GroupCourseId: courseId, LessonId: lessonId },
      default: {
        HomeworkId: id, UserId: userId, GroupCourseId: courseId, LessonId: lessonId
      }
    });

    let homework = await UserHomework.findOne({
      where: { HomeworkId: id, UserId: userId, GroupCourseId: courseId, LessonId: lessonId },
      include: [
        {
          model: Homework,
          attributes: [
            'id',
            [`title_${language}`, 'title'],
            [`description_${language}`, 'description'],
            'point',
            'dueDate'
          ],
        },
      ],
    })

    if (!homework) {
      return res.status(403).json({
        message: "Homework not found or User doesn't have a homework",
      });
    }
    // return res.status(403).json({homework})

    if (!homework.startDate) {
      homework.startDate = new Date().toISOString();
      homework.status = 1;
      await homework.save();
    }

    // const Files = await HomeWorkFiles.findAll({
    //   where: { userId, homeWorkId: homework.Homework.id },
    //   attributes: ['id', ['fileName', 'name'], ['fileLink', 'link']],
    // });
    const Files = await HomeWorkFiles.findAll({
      attributes: ['id', ['fileName', 'name'], ['fileLink', 'link']],
      where: { userId, homeWorkId: id, courseId },
    });

    const response = {
      ...homework.dataValues,
      points: homework.points,
      status: homework.status,
      answer: homework.answer !== ' ' ? homework.answer : '',
      feedback: homework.feedback,
      Files,
      // UserStartDate: homework.startDate,
      // startDate: homework.Homework.startDate,
      // ...homework.dataValues.Homework.dataValues,
      // Files,
    };

    res.send(response);
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
    const { courseId } = req.query

    let homework = await UserHomework.findOne({
      where: { HomeworkId: id, UserId: userId, GroupCourseId: courseId },
    });

    if (homework.status == 2) {
      return res.status(403).json("You have homwork answer");
    }

    if (!homework) {
      return res.status(403).json({
        message: "Homework not found or User doesn't have a homework",
      });
    }


    answer.links.forEach(async (e) => {
      await HomeWorkFiles.create({
        fileName: e.name,
        fileLink: e.link,
        homeWorkId: homework.HomeworkId,
        userId,
        courseId: homework.GroupCourseId
      });
    })

    homework.answer = answer.value;
    homework.status = 2;
    await homework.save();

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
    const { language, courseId } = req.query;
    // const { filterType } = req.query;

    let users = await UserHomework.findAll({
      where: { HomeworkId: id, GroupCourseId: courseId },
      attributes: ['startDate', 'points', 'status'],
      include: [{ model: Users, attributes: ['firstName', 'lastName', 'id', 'image'] }],
    });
    if (!users) {
      return res.status(403).json({
        message: "Homework not found or Teacher doesn't have the homeworks",
      });
    }
    users = users.map((e) => {
      e = e.toJSON();
      delete e.dataValues;
      e['firstName'] = e.User.firstName;
      e['lastName'] = e.User.lastName;
      e['userId'] = e.User.id;
      e['image'] = e.User.image;

      delete e.User;
      return e;
    });
    const homeWorkInfo = await Homework.findOne({
      where: { id },
      attributes: [
        'id',
        [`title_${language}`, 'title'],
        [`description_${language}`, 'description'],
        'point',
        'dueDate'
      ],
    });

    return res.json({ homeWorkInfo, users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getHomeWorkForTeacherForSingleUser = async (req, res) => {
  try {
    const { id, userId, language, courseId } = req.query;

    let user = await UserHomework.findOne({
      where: { HomeworkId: id, UserId: userId, GroupCourseId: courseId },
      attributes: ['startDate', 'points', 'status', 'answer', 'feedback'],
      include: [{ model: Users, attributes: ['firstName', 'lastName', 'id', 'image'] }],
    });
    if (!user) return res.status(403).json({ success: false, message: 'Invalid userId' });
    const Files = await HomeWorkFiles.findAll({
      where: { userId, homeWorkId: id, courseId },
    });
    user = user.toJSON();
    delete user.dataValues;
    user['firstName'] = user.User.firstName;
    user['lastName'] = user.User.lastName;
    user['userId'] = user.User.id;
    user['image'] = user.User.image;
    user['files'] = Files;
    user.points = +user.points !== 0 ? user.points : null
    delete user.User;

    let homeWorkInfo = await Homework.findOne({
      where: { id },
      attributes: [
        'id',
        [`title_${language}`, 'title'],
        [`description_${language}`, 'description'],
        'point',
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
    const { courseId } = req.query;

    let [status] = await UserHomework.update(
      { points },
      { where: { HomeworkId: id, UserId: userId, GroupCourseId: courseId } },
    );
    // const userCourse = await UserCourses.findOne({
    //   where: { UserId: +userId, GroupCourseId: 12 },
    // });

    // console.log(userCourse, 1);

    // userCourse.totalPoints = +userCourse.totalPoints + +points;
    // userCourse.takenHomework = +userCourse.takenHomework + +points;
    // await UserCourses.save();
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
    const { user_id: userId } = req.user;

    const { creatorId } = await Users.findByPk(userId)

    const teacher = await Users.findAll({
      where: {
        role: "TEACHER",
        creatorId: +userId
      },
      attributes: ["id", "firstName", "lastName", "image", "role"]
    });

    const teacherIds = teacher.reduce((aggr, value) => {
      aggr.push(value.id)
      return aggr;
    }, []);

    const homeworks = await Homework.findAll({
      where: {
        creatorId: [userId, creatorId, ...teacherIds]
      },
      attributes: ['id', ['title_en', 'title'], 'dueDate'],
    });

    return res.json(homeworks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getHomeworkTitlesForTeacher = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { language } = req.query;

    let lessons = await UserCourses.findAll({
      where: { UserId: userId },
      attributes: ['id', ['UserId', 'userId']],
      include: [
        {
          model: GroupCourses,
          include: [
            {
              model: Lesson,
              include: {
                model: Homework,
                as: 'homework',
                attributes: ["id", [`title_${language}`, "title"], "dueDate"]
              },
              attributes: ["id", [`title_${language}`, "title"]],
              order: [['id', 'DESC']],
              through: {
                attributes: []
              }
            },
          ],
        },
      ],
    });

    let coursLessons = lessons.reduce((aggr, value) => {
      const lesson = value.GroupCourse.Lessons
      aggr = [...aggr, ...lesson]
      return aggr;
    }, []);

    const homeworks = coursLessons.reduce((aggr, value) => {
      aggr = [...aggr, ...value.homework]
      return aggr
    }, [])

    const teacherHomework = await Homework.findAll({
      where: {
        creatorId: userId
      },
      attributes: ['id', [`title_${language}`, "title"], 'dueDate'],
    });

    const uniqueHomework = [...homeworks, ...teacherHomework].filter(
      (item, index, self) =>
        index === self.findIndex((hw) => hw.id === item.id)
    );

    return res.json(uniqueHomework);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
}

const homeworkPoints = async (req, res) => {
  try {
    const { userId, homeworkId, points, feedback } = req.body;
    const { courseId } = req.query;
    // const { lessonId } = await HomeworkPerLesson.findOne({ where: { homeworkId } });
    // const { maxPoints } = await Lesson.findByPk(lessonId);

    const [status] = await UserHomework.update(
      {
        points,
        feedback,
      },
      {
        where: {
          GroupCourseId: courseId,
          UserId: userId,
          HomeworkId: homeworkId,
        },
      },
    );

    const userCourse = await UserCourses.findOne({
      where: { UserId: +userId, GroupCourseId: courseId },
    });

    userCourse.totalPoints = +userCourse.totalPoints + +points;
    userCourse.takenHomework = +userCourse.takenHomework + +points;
    await userCourse.save();

    // 10*50/100
    // const userLesson = await UserLesson.findOne({
    //   where: {
    //     LessonId: lessonId,
    //     UserId: userId,
    //   },
    // });
    // userLesson.points = userLesson.points + Math.ceil((((maxPoints / 2) * points) / 100) * 10) / 10;
    // await userLesson.save();
    if (status === 0) {
      return res.status(403).json({
        message: 'Homework not found',
      });
    }
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getUserHomeworkPoints = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { courseId } = req.params;
    const { language } = req.query;

    let homework = await Homework.findAll({
      include: [
        {
          model: Lesson,
          through: { attributes: [] },
          include: [
            {
              model: GroupCourses,
              through: { attributes: [] },
              required: false,

              where: {
                id: courseId,
              },
            },
          ],
        },
      ],
      order: [['id', 'DESC']],
      attributes: [
        'id',
        [`title_${language}`, 'title'],
        [`description_${language}`, 'description'],
        'point',
      ],
    });
    // homework = homework.map((e) => {delete e.Lesson);
    homework = homework.map((el) => {
      // console.log();
      return {
        id: el.dataValues.id,
        title: el.dataValues.title,
        description: el.dataValues.description,
      };
    });

    const { Users: students } = await Groups.findOne({
      where: { assignCourseId: courseId },
      attributes: [],
      include: [
        {
          model: Users,
          where: { role: 'STUDENT' },
          include: [
            {
              model: UserHomework,
              attributes: ['points', 'HomeworkId'],
              order: [['HomeworkId', 'ASC']],
            },
            {
              model: UserInterview,
              attributes: ['points', 'calendarId', 'userId'],
              order: [['userId', 'ASC']],
            },
          ],
          attributes: ['id', 'firstName', 'lastName'],
          through: { attributes: [] },
        },
      ],
    });
    students.forEach((student) => {
      student.UserHomeworks.sort((a, b) => b.HomeworkId - a.HomeworkId);
    });
    // let interview = await UserInterview.findOne({
    //   where: {
    //     courseId,
    //     userId: {
    //       [Op.contains]: [userId]
    //     }
    //   },
    // });

    return res.json({ homework, students });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong .' });
  }
};

const deleteHomework = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { homeworkId } = req.params;
    const deleteHomwork = await Homework.destroy({
      where: {
        id: homeworkId,
        creatorId: userId
      }
    });
    if (deleteHomwork === 0) return res.status(400).json({ success: false, message: "You do not have permission to delete this homework." })
    if (deleteHomwork === 1) {
      await UserHomework.destroy({
        where: {
          HomeworkId: homeworkId
        }
      })
    };
    res.status(200).json({ success: true })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong .' });
  }
}

const updateHomework = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { homeworkId } = req.params;
    const {
      title_en,
      description_en,
      title_am,
      description_am,
      title_ru,
      description_ru,
      point,
      dueDate
    } = req.body

    const updateData = {
      title_en,
      description_en,
      title_am,
      description_am,
      title_ru,
      description_ru,
      point,
      dueDate
    }

    const homework = await Homework.findOne({
      where: {
        id: homeworkId,
        creatorId: userId
      }
    })
    if (!homework) return res.status(400).json({ success: false, message: "You do not have permission to update this homework." })
    const updateHomework = await Homework.update(
      {
        updateData
      },
      {
        where: {
          id: homeworkId,
          creatorId: userId
        }
      }
    )

    res.status(200).json({ success: true })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong .' });
  }
}

const getHomeworkForTeacher = async (req, res) => {
  try {
    const { homeworkId } = req.params;

    const homework = await Homework.findOne({
      where: {
        id: homeworkId
      }
    })

    if (!homework) {
      return res.status(404).json({ success: false, message: "Homework not found" })
    }

    return res.status(200).json({ success: true, homework })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong .' });
  }
}

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
  getUserHomeworkPoints,
  getHomeworkTitlesForTeacher,
  deleteHomework,
  updateHomework,
  getHomeworkForTeacher,
};
