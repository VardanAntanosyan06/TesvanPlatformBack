const { Op, where } = require('sequelize');
const { sequelize } = require('../models');
const {
  Quizz,
  Option,
  Question,
  CoursesPerQuizz,
  UserAnswersQuizz,
  CoursesPerLessons,
  GroupCourses,
  Lesson,
  LessonsPerQuizz,
  UserCourses,
  UserPoints,
  UserLesson,
  UserAnswersOption,
  Users,
  Groups,
  IndividualGroupParams
} = require('../models');

const createQuizz = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const {
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      lessonId,
      courseId,
      time,
      percent,
      questions,
      point,
    } = req.body;

    let { id: quizzId } = await Quizz.create({
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      time,
      percent,
      creatorId: userId
    });

    questions.forEach(async (question) => {
      await Question.create({
        title_en: question.title_en,
        title_ru: question.title_ru,
        title_am: question.title_am,
        quizzId,
        points: +point / questions.length,
      }).then((data) => {
        question.options.forEach(async (option) => {
          await Option.create({
            title_en: option.title_en,
            title_ru: option.title_ru,
            title_am: option.title_am,
            isCorrect: option.isCorrect,
            questionId: data.id,
          });
        });
      });
    });
    if (lessonId) {
      await LessonsPerQuizz.create({
        quizzId,
        lessonId,
      });
    } else {
      await CoursesPerQuizz.create({
        quizzId,
        courseId,
        type: 'Group',
      });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

// add time in models
const getQuizzes = async (req, res) => {
  // error
  try {
    const { user_id: userId } = req.user;
    const { quizzId } = req.params;
    const { language, courseId, lessonId } = req.query;

    const userPoints = await UserPoints.findOne({
      where: {
        userId,
        courseId,
        quizzId
      },
    });

    if (userPoints) {
      // return getUserQuizzAnswers(req, res)
      return res.status(403).json({ success: false, message: 'already passed' });
    }
    const userQuizzes = await UserAnswersQuizz.findOne({
      where: {
        userId,
        courseId,
        testId: quizzId
      }
    })

    if (userQuizzes) {
      // return getUserQuizzAnswers(req, res)
      return res.status(403).json({ success: false, message: 'already passed' });
    }

    let quizz = await Quizz.findOne({
      where: { id: quizzId },
      attributes: [
        'id',
        'title_am',
        'title_ru',
        'description_ru',
        'description_am',
        'time',
        'title_en',
        'description_en',
      ],
      include: [
        {
          model: Question,
          attributes: [
            'id',
            'quizzId',
            [`title_${language}`, 'title'],
            'title_ru',
            'title_en',
            'title_am',
            'points',
          ],
          include: {
            model: Option,
            attributes: ['id', [`title_${language}`, 'title'], 'title_ru', 'title_en', 'title_am'],
          },
        },
      ],
      order: [[Question, 'id', 'ASC']],
    });

    if (!quizz)
      return res.status(403).json({
        success: false,
        message: `with ID ${id} Quizz not found`,
      });

    quizz.Questions.forEach((question) => {
      question.Options = question.Options.sort((a, b) => a.id - b.id);
    });

    quizz = {
      ...quizz.dataValues,
      point: +quizz?.Questions[0].points * quizz?.Questions.length,
    };

    return res.status(200).json({ success: true, quizz });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};
const getQuizzesAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    let quizz = await Quizz.findOne({
      where: { id },
      include: [
        {
          model: Question,
          attributes: ['id', 'quizzId', 'title_ru', 'title_en', 'title_am', 'points'],
          include: [
            {
              model: Option,
              attributes: ['id', 'title_ru', 'title_en', 'title_am', 'isCorrect'],

            }
          ],
        }
      ],
      attributes: [
        'id',
        'title_am',
        'title_ru',
        'description_ru',
        'description_am',
        'time',
        'title_en',
        'description_en',
      ],
      order: [[Question, "id", "ASC"]]
    });

    quizz.Questions.forEach((question) => {
      question.Options = question.Options.sort((a, b) => a.id - b.id);
    });

    if (!quizz)
      return res.status(404).json({
        success: false,
        message: `with ID ${id} Quizz not found`,
      });

    quizz = {
      ...quizz.dataValues,
      point: +quizz.Questions[0].points * quizz.Questions.length,
    };

    return res.status(200).json({ success: true, quizz });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const submitQuizz = async (req, res) => {
  let transaction;

  try {
    transaction = await sequelize.transaction(); // sequelize-ը քո instance-ն է

    const { user_id: userId } = req.user;
    const { quizzId, questionId, optionId } = req.body;
    const { courseId, lessonId } = req.query;

    const quizz = await Quizz.findOne({
      where: { id: quizzId },
      include: [
        {
          model: Question,
          attributes: ['id', 'quizzId', 'title_ru', 'title_en', 'title_am', 'points'],
          where: { id: questionId },
          include: [
            {
              model: Option,
              attributes: ['id', 'title_ru', 'title_en', 'title_am', 'isCorrect'],
            },
          ],
        },
      ],
      order: [[Question, 'id', 'ASC']],
      transaction,
    });

    if (!quizz || !quizz.Questions.length) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Question not found in quizz.' });
    }

    const question = quizz.Questions[0];
    question.Options.sort((a, b) => a.id - b.id);

    await UserAnswersQuizz.destroy({
      where: { userId, testId: quizzId, questionId, courseId },
      transaction,
    });

    const { id: userAnswerQuizzId } = await UserAnswersQuizz.create({
      userId,
      testId: quizzId,
      questionId,
      optionId,
      courseId,
      lessonId: +lessonId || 0,
      questionTitle_en: question.title_en,
      questionTitle_am: question.title_am,
      questionTitle_ru: question.title_ru,
      point: question.points,
    }, { transaction });

    for (const option of question.Options) {
      await UserAnswersOption.create({
        userAnswerQuizzId,
        title_en: option.title_en,
        title_am: option.title_am,
        title_ru: option.title_ru,
        isCorrect: option.isCorrect,
        userAnswer: +option.id === +optionId,
      }, { transaction });
    }

    await transaction.commit();
    return res.status(200).json({ success: true });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};



const finishQuizz = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { quizzId, isFinal, lessonId } = req.body;
    const { courseId } = req.query

    const userPoint = await UserPoints.findOne({
      where: {
        courseId,
        userId,
        lessonId: lessonId ? lessonId : 0
      }
    })
    if (userPoint) {
      return res.status(403).json({ success: false, message: 'the finish has already been set' });
    }

    const userCourses = await UserCourses.findOne({
      where: { UserId: userId, GroupCourseId: courseId },
    });

    const group = await Groups.findOne({ where: { assignCourseId: courseId } })
    if (group.type === "individual") {
      const openLessonCount = await IndividualGroupParams.findOne({
        where: {
          groupId: group.id,
          courseId: group.assignCourseId,
          userId
        }
      });

      const newCount = openLessonCount.lessonCount++;
      openLessonCount.openLessonCount = newCount;
      await openLessonCount.save()
    }

    let point = 0
    let correctAnswers = 0

    // if (!lessonId) {
    //   let correctAnswers = await Quizz.findByPk(quizzId, {
    //     attributes: ['id'],
    //     include: [
    //       {
    //         model: Question,
    //         attributes: ['id', 'points'],
    //         include: [
    //           {
    //             model: Option,
    //             where: { isCorrect: true },
    //             attributes: ['id'],
    //           },
    //         ],
    //       },
    //     ],
    //   });

    //   // const quizzPoints = correctAnswers.Questions[0].points * correctAnswers.Questions.length;
    //   const oneQuizzPoint = correctAnswers.Questions[0].points;

    //   correctAnswers = correctAnswers.Questions.map((e) => e.Options[0].id).sort(
    //     (a, b) => a.id - b.id,
    //   );

    //   const userAnswers = await UserAnswersQuizz.findAll({
    //     where: {
    //       testId: quizzId,
    //       userId,
    //     },
    //     attributes: ['optionId'],
    //     order: [['id', 'ASC']],
    //   });
    //   userAnswers.map((e) => {
    //     correctAnswers.push(e.optionId);
    //   });

    //   // const point =
    //   //   (Math.round(
    //   //     ((correctAnswers.length - new Set(correctAnswers).size) /
    //   //       Math.ceil(correctAnswers.length / 2)) *
    //   //     100,
    //   //   ) *
    //   //     (10 / 2)) /
    //   //   100;

    //   let point = (correctAnswers.length - new Set(correctAnswers).size) * oneQuizzPoint;

    //   point = parseFloat(point.toFixed(2));

    //   await UserPoints.findOrCreate({
    //     where: {
    //       userId,
    //       quizzId,
    //       courseId,
    //       isFinal,
    //     },
    //     defaults: {
    //       quizzId,
    //       userId,
    //       correctAnswers: correctAnswers.length - new Set(correctAnswers).size,
    //       point: point,
    //       isFinal,
    //       courseId,
    //     },
    //   });

    //   userCourses.totalPoints = +userCourses.totalPoints + point;
    //   userCourses.takenQuizzes = +userCourses.takenQuizzes + point;
    //   await userCourses.save();

    //   return res.json({ success: true });
    // }
    // const { maxPoints } = await Lesson.findByPk(lessonId);

    const userAnswers = await UserAnswersQuizz.findAll({
      where: { userId, testId: quizzId, courseId },
      include: [
        {
          model: UserAnswersOption,
          as: 'userAnswersOption',
        }
      ],
      order: [
        ['id', 'ASC'],
        [{ model: UserAnswersOption, as: 'userAnswersOption' }, 'id', 'ASC']
      ],
    })

    const quiz = await Quizz.findAll({
      where: { id: quizzId },
      attributes: [
        'id',
        'title_am',
        'title_ru',
        'description_ru',
        'description_am',
        'title_en',
        'description_en',
      ],
      include: [
        {
          model: Question,
          attributes: [
            'id',
            'quizzId',
            'title_ru',
            'title_en',
            'title_am',
            'points',
          ],
          include: [
            {
              model: Option,
              attributes: ['id', 'title_ru', 'title_en', 'title_am'],
            }
          ]
        },
      ],
      order: [[Question, 'id', 'ASC']],
    });

    // const unansweredQuestions = quiz.reduce((aggr, value) => {
    //   aggr[value.id] = value;
    //   return aggr
    // }, {})


    userAnswers.forEach(async (userAnswer) => {
      // if (!unansweredQuestions[userAnswer.testId]) {
      //   const { id: userAnswerQuizzId } = await UserAnswersQuizz.create({
      //     userId,
      //     testId: unansweredQuestions[userAnswer.testId].id,
      //     questionId: 0,
      //     optionId: 0,
      //     courseId: courseId,
      //     lessonId: lessonId,
      //     questionTitle_en: unansweredQuestions[userAnswer.testId].title_en,
      //     questionTitle_am: unansweredQuestions[userAnswer.testId].title_am,
      //     questionTitle_ru: unansweredQuestions[userAnswer.testId].title_ru,
      //     point: 0
      //   });

      //   for (const option of unansweredQuestions[userAnswer.testId].Questions[0].Options) {
      //     await UserAnswersOption.create({
      //       userAnswerQuizzId: userAnswerQuizzId,
      //       title_en: option.title_en,
      //       title_am: option.title_am,
      //       title_ru: option.title_ru,
      //       isCorrect: option.isCorrect,
      //       userAnswer: false
      //     });
      //   }
      // }
      userAnswer.userAnswersOption.forEach((option) => {
        if (option.userAnswer && option.isCorrect) {
          point = point + +userAnswer.point
          correctAnswers += 1
        }
      })
    })

    point = parseFloat(point.toFixed(2));

    await UserPoints.findOrCreate({
      where: {
        userId,
        quizzId,
        courseId,
        lessonId
      },
      defaults: {
        quizzId,
        userId,
        point: point,
        correctAnswers: correctAnswers,
        isFinal,
        courseId,
      },
    });

    // const userLesson = await UserLesson.findOne({
    //   where: { UserId: userId, GroupCourseId: courseId, LessonId: lessonId },
    // });

    userCourses.totalPoints = +userCourses.totalPoints + point;
    userCourses.takenQuizzes = +userCourses.takenQuizzes + point
    await userCourses.save();

    // userLesson.points = +userLesson.points + point
    // await userLesson.save();

    return res.json({
      point,
      correctAnswers
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getAll = async (req, res) => {
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
    const quizzes = await Quizz.findAll({
      where: {
        creatorId: [userId, creatorId, ...teacherIds]
      },
      attributes: ['id', ['title_en', 'title']],
    });

    return res.json(quizzes);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getAllTitleForTeacher = async (req, res) => {
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
                model: Quizz,
                as: 'quizz',
                attributes: ["id", [`title_${language}`, "title"]]
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

    const quizz = coursLessons.reduce((aggr, value) => {
      aggr = [...aggr, ...value.quizz]
      return aggr
    }, [])

    const teacherQuizz = await Quizz.findAll({
      where: {
        creatorId: userId
      },
      attributes: ['id', [`title_${language}`, "title"]],
    });


    const uniqueQuizz = [...quizz, ...teacherQuizz].filter(
      (item, index, self) =>
        index === self.findIndex((hw) => hw.id === item.id)
    );

    return res.json(uniqueQuizz);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteQuizz = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;

    const { creatorId } = await Quizz.findOne({
      where: {
        id
      }
    })

    if (+creatorId !== +userId) return res.status(400).json({ success: false, message: "You do not have permission to delete this quiz." });

    const questions = await Question.findAll({ where: { quizzId: id } });

    for (const question of questions) {
      await Option.destroy({ where: { questionId: question.id } });
    }

    Question.destroy({ where: { quizzId: id } });

    Quizz.destroy({ where: { id } });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const updateQuizz = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      time,
      questions,
      point,
    } = req.body;

    const { user_id: userId } = req.user;

    const { creatorId } = await Quizz.findOne({
      where: {
        id
      }
    });

    if (+creatorId !== +userId) return res.status(400).json({ success: false, message: "You do not have permission to update this quiz." });

    const questionCount = await Question.findAll({
      where: {
        quizzId: id,
      },
    })
    if (questionCount.length !== questions.length) {
      return res.status(400).json({ message: 'Something went wrong.' });
    }
    // Update the Quizz details
    await Quizz.update(
      {
        title_en,
        title_ru,
        title_am,
        description_en,
        description_ru,
        description_am,
        time,
      },
      { where: { id: id } },
    );

    questions.forEach(async (question) => {
      await Question.update(
        {
          title_en: question.title_en,
          title_am: question.title_am,
          title_ru: question.title_ru,
          points: +point / questions.length,
        },
        {
          where: {
            id: question.id,
          }
        }
      )

      question.options.forEach(async (option) => {
        await Option.update(
          {
            title_en: option.title_en,
            title_ru: option.title_ru,
            title_am: option.title_am,
            isCorrect: option.isCorrect,
          },
          {
            where: {
              id: option.id
            }
          }
        )
      });
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getUserAnswers = async (req, res) => {
  try {
    const { quizzId, isFinal } = req.body;
    const { courseId } = req.query;
    const { user_id: userId } = req.user;

    const userPoints = await UserPoints.findOne({
      where: {
        userId,
        quizzId,
        courseId,
        isFinal,
      },
    });

    if (!userPoints) return res.status(404).json({ success: false });

    return res.json({
      success: true,
      point: userPoints.point,
      correctAnswers: userPoints.correctAnswers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getUserQuizzAnswers = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { quizzId } = req.params;
    const { courseId, language, lessonId } = req.query;
    language ? language : language = "en"

    const userAnswersQuizz = await UserAnswersQuizz.findAll({
      where: {
        lessonId: lessonId ? lessonId : 0,
        userId,
        courseId,
      },

      include: [
        {
          model: UserAnswersOption,
          as: 'userAnswersOption',
          attributes: [[`title_${language}`, 'title'], 'isCorrect', 'userAnswer'],
        },
      ],
      attributes: [[`questionTitle_${language}`, 'questionTitle']],
      order: [
        ['id', 'ASC'],
        [{ model: UserAnswersOption, as: 'userAnswersOption' }, 'id', 'ASC'],
      ],
    });

    // const trueAnswer = userAnswersQuizz.reduce((aggr, value) => {
    //   value.
    //   return aggr
    // }, {})


    return res.status(200).json(userAnswersQuizz);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Something Went Wrong. ' });
  }
};

module.exports = {
  createQuizz,
  getQuizzes,
  submitQuizz,
  finishQuizz,
  getAll,
  getUserAnswers,
  deleteQuizz,
  updateQuizz,
  getQuizzesAdmin,
  getUserQuizzAnswers,
  getAllTitleForTeacher
};
