// hello World !!

const {
  UserLesson,
  Lesson,
  Quizz,
  Question,
  Option,
  Video,
  LessonsPerQuizz,
  UserCourses,
  Message,
  HomeworkPerLesson,
  UserAnswersQuizz,
  Homework,
  Presentations,
  UserPoints,
  LessonTime,
  UserHomework,
  CoursesPerLessons,
} = require('../models');
const { v4 } = require('uuid');
const path = require('path');
const uuid = require('uuid');
const fs = require('fs');

const lessonsperquizz = require('../models/lessonsperquizz');
const { userSockets } = require('../userSockets');
const { where } = require('sequelize');

const allowedFormats = [
  "video/mp4",
  "video/mpeg"
];

const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { language } = req.query;
    const { user_id: userId } = req.user;

    let lessons = await UserLesson.findAll({
      where: { GroupCourseId: courseId, UserId: userId },
      attributes: ['points', 'attempt'],
      include: [
        {
          model: Lesson,
          attributes: [
            'id',
            'courseId',
            'number',
            [`title_${language}`, 'title'],
            [`description_${language}`, 'description'],
            'maxPoints',
          ],
        },
      ],
    });

    if (!lessons.length) {
      return res.status(403).json({
        message: "Lessons not found or User doesn't have the lessons",
      });
    }

    lessons = lessons.map((lesson) => {
      return {
        points: lesson.points,
        attempt: lesson.attempt,
        ...lesson.dataValues.Lesson.dataValues,
      };
    });

    res.send(lessons);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getLessonTitles = async (req, res) => {
  try {
    const { language } = req.query;

    let lessons = await Lesson.findAll({
      attributes: [
        'id',
        [`title_${language}`, 'title'],
        [`description_${language}`, 'description'],
      ],
      order: [['id', 'DESC']],
    });

    if (!lessons.length) {
      return res.status(403).json({
        message: 'Lessons not found',
      });
    }

    return res.send(lessons);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getLesson = async (req, res) => {

  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;
    const { language, courseId } = req.query;

    const lessonTime = await LessonTime.findOne({
      where: {
        lessonId: id,
        userId,
      },
    });

    let lesson = await UserLesson.findOne({
      where: { LessonId: id, UserId: userId, GroupCourseId: courseId },
      attributes: ['points', 'attempt'],
      include: [
        {
          model: Lesson,
          attributes: [
            [`title_${language}`, 'title'],
            [`description_${language}`, 'description'],
            [`htmlContent_${language}`, 'htmlContent'],
          ],
          include: [
            {
              model: Presentations,
              attributes: [
                [`title_${language}`, 'title'],
                [`description_${language}`, 'text'],
                [`url_${language}`, 'url'],
              ],
            },
            {
              model: Quizz,
              as: 'quizz',
              attributes: [
                'id',
                [`title_${language}`, 'title'],
                [`description_${language}`, 'description'],
              ],
              through: {
                attributes: [],
              },
              include: {
                model: Question,
                attributes: ['id', 'points'],
              },
            },
            {
              model: Homework,
              as: 'homework',
              attributes: [
                'id',
                [`title_${language}`, 'title'],
                [`description_${language}`, 'description'],
                'point',
              ],
              through: {
                attributes: [],
              },
            },
            {
              model: Video,
              as: "video",
              attributes: [
                'id',
                'lessonId',
                [`title_${language}`, 'title'],
                [`description_${language}`, 'description'],
              ],
            }
          ],
        },
      ],
    });

    if (!lesson) {
      return res.status(403).json({
        message: "Lessons not found or User doesn't have the lessons",
      });
    }

    let homeworkPoint
    if (lesson.Lesson.homework.length > 0) {
      homeworkPoint = await UserHomework.findOne({
        where: {
          LessonId: id,
          UserId: userId,
          HomeworkId: lesson.Lesson.homework[0].id,
          GroupCourseId: courseId
        },
      });
    }

    let userPoint = null;

    if (lesson.Lesson.quizz.length > 0) {
      userPoint = await UserPoints.findOne({
        where: {
          courseId,
          userId,
          lessonId: id,
          isFinal: false,
        },
      });
    }

    const maxQuizzPoints =
      lesson.Lesson.quizz[0]?.Questions[0]?.points * lesson.Lesson.quizz[0]?.Questions?.length;
    const maxHomeworkPoints = +lesson.Lesson.homework.length > 0 ? +lesson.Lesson.homework[0].point : 0
    const maxPoints = +maxHomeworkPoints + +maxQuizzPoints;
    const lessonPoints =
      +(homeworkPoint ? homeworkPoint.points : 0) + +(userPoint ? userPoint.point : 0);

    let quizPoints;
    userPoint ? (quizPoints = +userPoint.point) : false,
      // parseFloat(+quizPoints.toFixed(2));

      (lesson = {
        points: parseFloat(lessonPoints.toFixed(2)),
        maxPoints: maxPoints ? maxPoints : 0,
        pointsOfPercent: Math.round((lessonPoints * 100) / maxPoints),
        quizzPoint: userPoint ? parseFloat(quizPoints.toFixed(2)) : null,
        maxQuizzPoints: maxQuizzPoints ? maxQuizzPoints : 0,
        homeworkPoint: homeworkPoint ? (+homeworkPoint.points !== 0 ? homeworkPoint.points : null) : null,
        maxHomeworkPoints: maxHomeworkPoints,
        attempt: lesson.attempt,
        time: lessonTime ? lessonTime.time : null,
        ...lesson.dataValues.Lesson.dataValues,
      });

    res.send(lesson);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getLessonForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;

    let lesson = await Lesson.findOne({
      where: { id },
      include: [
        {
          model: Presentations,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        {
          model: Quizz,
          as: 'quizz',
          through: {
            attributes: [],
          },
          attributes: [
            'id',
            [`title_${language}`, 'title'],
            [`description_${language}`, 'description'],
          ],
        },
        {
          model: Homework,
          as: 'homework',
          through: {
            attributes: [],
          },
          attributes: [
            'id',
            [`title_${language}`, 'title'],
            [`description_${language}`, 'description'],
          ],
        },
        {
          model: Video,
          as: "video",
          attributes: {
            exclude: ['lessonId']
          },
        }
      ],
    });

    if (!lesson) {
      return res.status(403).json({
        message: "Lessons not found or User doesn't have the lessons",
      });
    }

    lesson = {
      ...lesson.dataValues,
      presentation_en: {
        presentationTitle_en: lesson.Presentations[0].title_en,
        url: lesson.Presentations[0].url_en,
        presentationDescription_en: lesson.Presentations[0].description_en,
      },
      presentation_ru: {
        presentationTitle_ru: lesson.Presentations[0].title_ru,
        url: lesson.Presentations[0].url_ru,
        presentationDescription_ru: lesson.Presentations[0].description_ru,
      },
      presentation_am: {
        presentationTitle_am: lesson.Presentations[0].title_am,
        url: lesson.Presentations[0].url_am,
        despresentationDescription_amcription: lesson.Presentations[0].description_am,
      },
    };
    delete lesson.Presentations;
    res.send(lesson);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const submitQuizz = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;
    const { points } = req.body;

    let lesson = await UserLesson.findOne({
      where: { LessonId: id, UserId: userId },
    });

    if (!lesson) {
      return res.status(403).json({ message: "Lesson not found or User doesn't have a lesson" });
    }

    let currentPoints = lesson.points;
    let collectedPoints;

    if (lesson.attempt === 1) {
      lesson.points = points;
      collectedPoints = points;
      lesson.attempt = lesson.attempt + 1;
    } else if (lesson.attempt === 2) {
      collectedPoints = points - 10;
      lesson.points = collectedPoints > currentPoints ? collectedPoints : currentPoints;
      lesson.attempt = lesson.attempt + 1;
    } else if (lesson.attempt === 3) {
      collectedPoints = points - 20;
      lesson.points = collectedPoints > currentPoints ? collectedPoints : currentPoints;
      lesson.attempt = lesson.attempt + 1;
    } else {
      return res.status(403).json({ message: 'No more attempts' });
    }

    await lesson.save();

    res.send({ points: collectedPoints });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const openLesson = async (req, res) => {
  try {
    const { id, courseId } = req.body;

    let userCourses = await UserCourses.findAll({
      where: { GroupCourseId: courseId },
    });
    const lesson = await Lesson.findOne({ where: { id } });
    console.log(userCourses.length, lesson);
    if (!lesson) {
      return res.status(404).json('lesson not found');
    }
    if (!lesson.isOpen) {
      await Promise.all(
        userCourses.map(async (user) => {
          await UserLesson.findOrCreate({
            where: {
              UserId: user.UserId,
              GroupCourseId: courseId,
              LessonId: lesson.id,
            },
            defaults: {
              UserId: user.UserId,
              GroupCourseId: courseId,
              LessonId: lesson.id,
            },
          });
          Message.create({
            UserId: user.UserId,
            title_en: 'New Lesson',
            title_ru: 'New Lesson',
            title_am: 'New Lesson',
            description_en: 'You have a new Lesson!',
            description_ru: 'You have a new Lesson!',
            description_am: 'You have a new Lesson!',
            type: 'info',
          });
          const userSocket = userSockets.get(user.UserId);
          if (userSocket) {
            userSocket.emit('new-message', 'New Message');
          }
        }),
      );
    } else {
      await Promise.all(
        userCourses.map(async (user) => {
          try {
            await UserLesson.destroy({
              where: {
                UserId: user.UserId,
                GroupCourseId: courseId,
                LessonId: lesson.id,
              },
            });
          } catch (error) {
            console.error(error);
          }
        }),
      );
    }

    lesson.isOpen = !lesson.isOpen;
    lesson.save();
    return res.send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const createLesson = async (req, res) => {
  try {
    const {
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      htmlContent_en,
      htmlContent_ru,
      htmlContent_am,
      quizzId,
      homeworkId,
      presentationTitle_en,
      presentationDescription_en,
      presentationTitle_ru,
      presentationDescription_ru,
      presentationTitle_am,
      presentationDescription_am,
      videoTitle
    } = req.body;

    const video = req.files?.video;

    if (req.files) {
      const { file_en, file_ru, file_am } = req.files;
      const fileEnType = file_en.mimetype.split('/')[1];
      const fileNameEn = v4() + '.' + fileEnType;
      file_en.mv(path.resolve(__dirname, '..', 'static', fileNameEn));

      const fileRuType = file_en.mimetype.split('/')[1];
      const fileNameRu = v4() + '.' + fileRuType;
      file_ru.mv(path.resolve(__dirname, '..', 'static', fileNameRu));

      const fileAmType = file_en.mimetype.split('/')[1];
      const fileNameAm = v4() + '.' + fileAmType;
      file_am.mv(path.resolve(__dirname, '..', 'static', fileNameAm));

      const { id: lessonId } = await Lesson.create({
        title_en,
        title_ru,
        title_am,
        description_ru,
        description_am,
        description_en,
        maxPoints: 0,
        htmlContent_en,
        htmlContent_ru,
        htmlContent_am,
      });

      await Presentations.create({
        title_en: presentationTitle_en,
        url_en: fileNameEn,
        description_en: presentationDescription_en,
        title_ru: presentationTitle_ru,
        url_ru: fileNameRu,
        description_ru: presentationDescription_ru,
        title_am: presentationTitle_am,
        url_am: fileNameAm,
        description_am: presentationDescription_am,
        lessonId,
      });

      if (!isNaN(+homeworkId)) {
        await HomeworkPerLesson.create({
          homeworkId,
          lessonId,
        });
      }

      // if(homeworkId.length>0){
      //   for(const id of homeworkId){
      //     await HomeworkPerLesson.create({
      //       lessonId,
      //       homeworkId: id
      //     })
      //   }
      // };

      if (video) {

        if (!allowedFormats.includes(video.mimetype)) {
          return res.status(400).json({ success: false, message: 'Unsupported file format' });
        };

        const type = video.mimetype.split('/')[1];
        const videoFilename = uuid.v4() + '.' + type;
        await video.mv(path.resolve(__dirname, '../', 'static', videoFilename));

        await Video.create({
          lessonId,
          url: videoFilename,
          title_am: videoTitle,
          title_en: videoTitle,
          title_ru: videoTitle,
          description_am,
          description_en,
          description_ru
        });
      }
      // else {
      //   const courses = await CoursesPerLessons.findAll({
      //     where: {
      //       lessonId,
      //     },
      //   });
      //   const uniqueCourses = Array.from(
      //     courses.reduce((map, obj) => map.set(obj.courseId, obj), new Map()).values(),
      //   );
      // }
      
      if (!isNaN(+quizzId)) {
        await LessonsPerQuizz.create({
          lessonId,
          quizzId,
        });
      }

      return res.status(200).json({ success: true });
    } else {
      res.status(400).json({ message: "You didn't specify a presentation" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      attributes: ['id', 'name'],
    });

    return res.json(lessons);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    await Lesson.destroy({ where: { id } });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const updateLesson = async (req, res) => {
  try {
    const {
      lessonId,
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      htmlContent_en,
      htmlContent_ru,
      htmlContent_am,
      quizzId,
      homeworkId,
      presentationTitle_en,
      presentationDescription_en,
      presentationTitle_ru,
      presentationDescription_ru,
      presentationTitle_am,
      presentationDescription_am,
      videoTitle
    } = req.body;
    const video = req.files?.video;

    if (video) {
      if (!allowedFormats.includes(video.mimetype)) {
        return res.status(400).json({ success: false, message: 'Unsupported file format' });
      };

      const { url } = await Video.findOne({
        where: {
          lessonId
        }
      });

      fs.unlinkSync(path.resolve(__dirname, "../", "static", url));

      const type = video.mimetype.split('/')[1];
      const videoFilename = uuid.v4() + '.' + type;
      await video.mv(path.resolve(__dirname, '../', 'static', videoFilename));

      await Video.update(
        {
          url: videoFilename,
          title_am: videoTitle,
          title_en: videoTitle,
          title_ru: videoTitle,
          description_am,
          description_en,
          description_ru
        },
        {
          where: {
            lessonId
          }
        }
      );
    }

    if (isNaN(+homeworkId)) {
      await HomeworkPerLesson.destroy({ where: { lessonId } });
      await UserHomework.update(
        {
          HomeworkId: 0
        },
        {
          where: {
            LessonId: lessonId
          }
        }
      )
    } else {
      await HomeworkPerLesson.create({
        lessonId,
        homeworkId
      });
    }

    await Lesson.update(
      {
        title_en,
        title_ru,
        title_am,
        description_ru,
        description_am,
        description_en,
        maxPoints: 0,
        htmlContent_en,
        htmlContent_ru,
        htmlContent_am,
      },
      { where: { id: lessonId } },
    );

    if (req.files) {
      const { file_en, file_ru, file_am } = req.files;
      const fileEnType = file_en.mimetype.split('/')[1];
      const fileNameEn = v4() + '.' + fileEnType;
      file_en.mv(path.resolve(__dirname, '..', 'static', fileNameEn));

      const fileRuType = file_en.mimetype.split('/')[1];
      const fileNameRu = v4() + '.' + fileRuType;
      file_ru.mv(path.resolve(__dirname, '..', 'static', fileNameRu));

      const fileAmType = file_en.mimetype.split('/')[1];
      const fileNameAm = v4() + '.' + fileAmType;
      file_am.mv(path.resolve(__dirname, '..', 'static', fileNameAm));

      await Presentations.destroy({ where: { lessonId } });
      await Presentations.create({
        title_en: presentationTitle_en,
        url_en: fileNameEn,
        description_en: presentationDescription_en,
        title_ru: presentationTitle_ru,
        url_ru: fileNameRu,
        description_ru: presentationDescription_ru,
        title_am: presentationTitle_am,
        url_am: fileNameAm,
        description_am: presentationDescription_am,
        lessonId,
      });
    }
    // await Presentations.destroy({ where: { lessonId } });
    // await Presentations.create({
    //   title_en: presentationTitle_en,
    //   url_en: file_en,
    //   description_en: presentationDescription_en,
    //   title_ru: presentationTitle_ru,
    //   url_ru: file_ru,
    //   description_ru: presentationDescription_ru,
    //   title_am: presentationTitle_am,
    //   url_am: file_am,
    //   description_am: presentationDescription_am,
    //   lessonId,
    // });

    // if (!isNaN(+homeworkId)) {
    //   await HomeworkPerLesson.upsert({
    //     homeworkId,
    //     lessonId,
    //   });
    // }

    if (!isNaN(+homeworkId)) {
      const homeworkPerLesson = await HomeworkPerLesson.findOne({
        where: {
          lessonId,
        },
      });

      if (homeworkPerLesson) {
        homeworkPerLesson.homeworkId = homeworkId;
        await homeworkPerLesson.save();
      }

      const courses = await CoursesPerLessons.findAll({
        where: {
          lessonId,
        },
      });
      const uniqueCourses = Array.from(
        courses.reduce((map, obj) => map.set(obj.courseId, obj), new Map()).values(),
      );
      // console.log('///////////////', uniqueCourses);

      if (homeworkId) {
        if (uniqueCourses.length > 0) {
          await Promise.all(
            uniqueCourses.map(async (cours) => {
              await UserHomework.update(
                {
                  HomeworkId: homeworkId,
                },
                {
                  where: {
                    GroupCourseId: cours.courseId,
                    LessonId: lessonId,
                  },
                },
              );
            }),
          );
        }
      }
    }

    if (!isNaN(+quizzId)) {
      await LessonsPerQuizz.destroy({
        where: { lessonId },
      });
      await LessonsPerQuizz.create({
        lessonId,
        quizzId,
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const uploadFileAndGetUrl = async (file) => {
  const fileMimeType = file.mimetype.split('/')[1];
  const fileName = v4() + '.' + fileMimeType;
  await file.mv(path.resolve(__dirname, '..', 'static', fileName));
  return fileName;
};

const createLessonTime = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { lessonId } = req.params;
    const { time } = req.body;
    const { courseId } = req.query

    let lessons = await CoursesPerLessons.findOne({
      where: {
        courseId: courseId,
        lessonId
      }
    })

    if (+lessons.number === 1) {
      await LessonTime.create({
        userId,
        lessonId,
        time,
        courseId: courseId,
        number: lessons.number
      });
      return res.status(200).json({ success: true });
    } else {
      const lessonNumber = await LessonTime.findOne({
        where: {
          userId,
          courseId: courseId,
          number: +lessons.number - 1
        }
      })
      if (!lessonNumber) {
        return res.status(400).json({ success: false, message: "Not filled in order" });
      }
      await LessonTime.create({
        userId,
        lessonId,
        time,
        courseId: courseId,
        number: lessons.number
      });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong .' });
  }
};

const updateLessonTime = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { lessonId } = req.params;
    const { time } = req.body;
    await LessonTime.update(
      {
        time: time
      },
      {
        where: {
          userId,
          courseId: 12,
          lessonId
        }
      }
    )
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong .' });
  }
}
module.exports = {
  getLessons,
  getLesson,
  getLessonTitles,
  submitQuizz,
  openLesson,
  createLesson,
  getAllLessons,
  deleteLesson,
  updateLesson,
  getLessonForAdmin,
  createLessonTime,
  updateLessonTime
};
