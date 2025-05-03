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
  Users,
  GroupCourses
} = require('../models');
const { v4 } = require('uuid');
const path = require('path');
const uuid = require('uuid');
const fs = require('fs');
const { Op } = require('sequelize');

const lessonsperquizz = require('../models/lessonsperquizz');
const { userSockets } = require('../userSockets');

const allowedFormats = [
  "video/mp4",
  "video/mpeg"
];
const { courseBlock } = require('../service/CourseBlock')

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
    const { user_id: userId } = req.user;
    const { language } = req.query;
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

    let lessons = await Lesson.findAll({
      where: {
        creatorId: [userId, creatorId, ...teacherIds]
      },
      attributes: [
        'id',
        [`title_${language}`, 'title'],
        [`description_${language}`, 'description'],
      ],
      order: [['id', 'DESC']],
    });
    return res.send(lessons);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getLessonTitlesforTeacher = async (req, res) => {
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

    let teacherLessons = await Lesson.findAll({
      where: {
        creatorId: [userId]
      },
      attributes: [
        'id',
        [`title_${language}`, 'title'],
      ],
      order: [['id', 'DESC']],
    });

    const allLessons = [...teacherLessons, ...coursLessons];
    const uniqueLesson = allLessons.filter((value, index, self) =>
      index === self.findIndex((t) => t.id === value.id)
    );

    return res.send(uniqueLesson);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
}

const getLesson = async (req, res) => {

  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;
    const { language, courseId } = req.query;

    const block = await courseBlock(id,userId);

    if (block) {
      return res.status(401).json({ message: "Your course is inactive due to payment." });
    };

    const lessonTime = await LessonTime.findOne({
      where: {
        lessonId: id,
        courseId,
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
                'url',
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

    lesson.Lesson.homework = lesson.Lesson.homework.sort((a, b) => a.id - b.id);

    let homeworkPoint = []
    if (lesson.Lesson.homework.length > 0) {
      homeworkPoint = await UserHomework.findAll({
        where: {
          LessonId: id,
          UserId: userId,
          GroupCourseId: courseId
        },
        attributes: [["HomeworkId", "homeworkId"], "points"]
      });
    }

    const userHomeworkIds = homeworkPoint.reduce((aggr, value) => {
      aggr.push(value.homeworkId)
      return aggr;
    }, []);

    lesson.Lesson.homework.forEach((value) => {
      if (!userHomeworkIds?.includes(value.id)) {
        homeworkPoint.push({ homeworkId: value.id, points: "0" })
      }
    })

    const homeworkPointSum = homeworkPoint?.reduce((aggr, value) => {
      return aggr = aggr + +value.points
    }, 0)

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
    const maxHomeworkPoint = lesson.Lesson.homework.reduce((aggr, value) => {
      return aggr = aggr + +value.point
    }, 0);

    const maxQuizzPoints =
      lesson.Lesson.quizz[0]?.Questions[0]?.points * lesson.Lesson.quizz[0]?.Questions?.length;
    const maxHomeworkPoints = +lesson.Lesson.homework.length > 0 ? maxHomeworkPoint : 0
    const maxPoints = +maxHomeworkPoints + +maxQuizzPoints;
    const lessonPoints = (homeworkPointSum ? homeworkPointSum : 0) + +(userPoint ? userPoint.point : 0);

    let quizPoints;
    userPoint ? (quizPoints = +userPoint.point) : false,
      // parseFloat(+quizPoints.toFixed(2));

      (lesson = {
        points: parseFloat(lessonPoints.toFixed(2)),
        maxPoints: maxPoints ? maxPoints : 0,
        pointsOfPercent: Math.round((lessonPoints * 100) / maxPoints),
        quizzPoint: userPoint ? parseFloat(quizPoints.toFixed(2)) : null,
        maxQuizzPoints: maxQuizzPoints ? maxQuizzPoints : 0,
        homeworkPoint: homeworkPoint,
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
    const { user_id: userId } = req.user;
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
      presentationTitle_en,
      presentationDescription_en,
      presentationTitle_ru,
      presentationDescription_ru,
      presentationTitle_am,
      presentationDescription_am,
      videoTitle
    } = req.body;
    const homeworkId = JSON.parse(req.body.homeworkId);

    const video = req.files?.video;

    let fileNameEn
    if (req.files?.file_en) {
      const { file_en, file_ru, file_am } = req.files;
      const fileEnType = file_en.mimetype.split('/')[1];
      fileNameEn = v4() + '.' + fileEnType;
      file_en.mv(path.resolve(__dirname, '..', 'static', fileNameEn));
    };

    let fileNameRu
    if (req.files?.file_ru) {
      const { file_en, file_ru, file_am } = req.files;
      const fileRuType = file_ru.mimetype.split('/')[1];
      fileNameRu = v4() + '.' + fileRuType;
      file_ru.mv(path.resolve(__dirname, '..', 'static', fileNameRu));
    };

    let fileNameAm
    if (req.files?.file_am) {
      const { file_en, file_ru, file_am } = req.files;
      const fileAmType = file_am.mimetype.split('/')[1];
      fileNameAm = v4() + '.' + fileAmType;
      file_am.mv(path.resolve(__dirname, '..', 'static', fileNameAm));
    };

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
      creatorId: userId
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

    if (homeworkId.length > 0) {
      for (const id of homeworkId) {
        await HomeworkPerLesson.create({
          lessonId,
          homeworkId: id
        })
      }
    };

    if (video?.length > 0) {
      for (const value of video) {

        if (!allowedFormats.includes(value.mimetype)) {
          return res.status(400).json({ success: false, message: 'Unsupported file format' });
        };

        const type = value.mimetype.split('/')[1];
        const videoFilename = uuid.v4() + '.' + type;
        await value.mv(path.resolve(__dirname, '../', 'static', videoFilename));

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
    }

    if (!isNaN(+quizzId)) {
      await LessonsPerQuizz.create({
        lessonId,
        quizzId,
      });
    }

    return res.status(200).json({ success: true });

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
    const { user_id: userId } = req.user;

    const deleteLesson = await Lesson.destroy({
      where: {
        id,
        creatorId: userId
      }
    });

    await UserLesson.destroy({
      where: {
        LessonId: id,
      }
    });

    await CoursesPerLessons.destroy({
      where: {
        lessonId: id,
      }
    })
    if (deleteLesson === 0) return res.status(400).json({ success: false, message: "You do not have permission to delete this lessson." })

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
      presentationTitle_en,
      presentationDescription_en,
      presentationTitle_ru,
      presentationDescription_ru,
      presentationTitle_am,
      presentationDescription_am,
      videoTitle
    } = req.body;
    const homeworkId = req.body.homeworkId ? JSON.parse(req.body.homeworkId) : undefined
    const videos = req.files?.video;
    const file_en = req.files?.file_en
    const file_ru = req.files?.file_ru
    const file_am = req.files?.file_am
    const { user_id: userId } = req.user;

    const { creatorId } = await Lesson.findOne({
      where: {
        id: lessonId
      }
    })

    if (+creatorId !== +userId) return res.status(400).json({ success: false, message: "You do not have permission to update this lesson." });

    const updateVideoLogic = async (video) => {

      if (!allowedFormats.includes(video.mimetype)) {
        return res.status(400).json({ success: false, message: 'Unsupported file format' });
      };

      const type = video.mimetype.split('/')[1];
      const videoFilename = uuid.v4() + '.' + type;
      await video.mv(path.resolve(__dirname, '../', 'static', videoFilename));

      await Video.create(
        {
          lessonId,
          url: videoFilename,
          title_am: videoTitle,
          title_en: videoTitle,
          title_ru: videoTitle,
          description_am,
          description_en,
          description_ru
        },
      )

    }
    if (Array.isArray(videos)) {
      const findeVideos = await Video.findAll({
        where: {
          lessonId
        }
      });
      if (findeVideos) {
        findeVideos.forEach((findeVideo) => {
          fs.unlinkSync(path.resolve(__dirname, "../", "static", findeVideo.url));
        })
      }
      videos.forEach(async (video) => {
        await updateVideoLogic(video)
      })
    } else if (videos !== null && typeof videos === 'object' && !Array.isArray(videos)) {
      const findeVideos = await Video.findAll({
        where: {
          lessonId
        }
      });
      if (findeVideos) {
        findeVideos.forEach((findeVideo) => {
          fs.unlinkSync(path.resolve(__dirname, "../", "static", findeVideo.url));
        })
      }
      await updateVideoLogic(videos)
    }

    if (!videos) {
      const findeVideos = await Video.findAll({
        where: {
          lessonId
        }
      });
      if (findeVideos) {
        findeVideos.forEach((findeVideo) => {
          fs.unlinkSync(path.resolve(__dirname, "../", "static", findeVideo.url));
        })
      }
      await Video.destroy({
        where: {
          lessonId
        }
      });
    }

    if (!homeworkId) {
      HomeworkPerLesson.destroy({ where: { lessonId } });
      await UserHomework.destroy({
        where: {
          LessonId: lessonId
        }
      });
    } else {
      // Destroy all records with the matching lessonId
      await HomeworkPerLesson.destroy({ where: { lessonId } });
      // Create new records for each homeworkId
      Promise.all(homeworkId.map((id) => {
        HomeworkPerLesson.findOrCreate({
          where: {
            lessonId,
            homeworkId: id
          },
          default: {
            lessonId,
            homeworkId: id
          }
        });
      }));
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

    if (file_en || file_am || file_ru) {
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

    if (homeworkId?.length > 0) {
      await UserHomework.destroy({
        where: {
          LessonId: lessonId,
          HomeworkId: {
            [Op.notIn]: homeworkId ? homeworkId : null
          }
        }
      });

      homeworkId.forEach(async (id) => {
        const courses = await CoursesPerLessons.findAll({
          where: {
            lessonId,
          },
        });
        const uniqueCourses = Array.from(
          courses.reduce((map, obj) => map.set(obj.courseId, obj), new Map()).values(),
        );


        if (uniqueCourses.length > 0) {
          uniqueCourses.forEach(async (cours) => {

            await UserHomework.update(
              {
                HomeworkId: id,
              },
              {
                where: {
                  HomeworkId: id,
                  GroupCourseId: cours.courseId,
                  LessonId: lessonId,
                },
              },
            );

          })
        }

      })
    }

    if (quizzId) {
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
}
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
  getLessonTitlesforTeacher,
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
