const { Op, where } = require('sequelize');
const {
  Quizz,
  Option,
  Question,
  CoursesPerQuizz,
  UserAnswersQuizz,
  CoursesPerLessons,
  Lesson,
  LessonsPerQuizz,
  UserCourses,
  UserPoints,
  UserLesson,
} = require('../models');

const createQuizz = async (req, res) => {
  try {
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
    });

    questions.map((question, i) => {
      console.log(question.title_en, question.title_am);
      Question.create({
        title_en: question.title_en,
        title_ru: question.title_ru,
        title_am: question.title_am,
        quizzId,
      }).then((data) => {
        question.options.map((option, optionIndex) => {
          Option.create({
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
  try {
    const { id } = req.params;
    const { language } = req.query;

    let quizz = await Quizz.findOne({
      where: { id },
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
          ],
          order: [['id', 'ASC']],
          include: {
            model: Option,
            attributes: ['id', [`title_${language}`, 'title'], 'title_ru', 'title_en', 'title_am'],
          },
        },
      ],
    });

    if (!quizz)
      return res.status(403).json({
        success: false,
        message: `with ID ${id} Quizz not found`,
      });

    const questions_en = [];
    const questions_ru = [];
    const questions_am = [];

    quizz.Questions.map((question) => {
      const options_en = question.Options.map((e) => {
        return {
          title_en: e.title_en,
          isCorrect_en: e.isCorrect,
        };
      });
      questions_en.push({
        question_en: question.title_en,
        options_en: options_en,
      });
    });
    quizz.Questions.map((question) => {
      const options_ru = question.Options.map((e) => {
        return {
          title_ru: e.title_ru,
          isCorrect_ru: e.isCorrect,
        };
      });
      questions_ru.push({
        question_ru: question.title_ru,
        options_ru: options_ru,
      });
    });

    quizz.Questions.map((question) => {
      const options_am = question.Options.map((e) => {
        return {
          title_am: e.title_am,
          isCorrect_am: e.isCorrect,
        };
      });
      questions_am.push({
        question_am: question.title_am,
        options_am: options_am,
      });
    });
    quizz = {
      ...quizz.dataValues,
      questions_en,
      questions_ru,
      questions_am,
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
    const { language } = req.query;

    let quizz = await Quizz.findOne({
      where: { id },
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
          attributes: ['id', 'quizzId', 'title_ru', 'title_en', 'title_am'],
          order: [['id', 'ASC']],
          include: [
            {
              model: Option,
              attributes: ['id', 'title_ru', 'title_en', 'title_am', 'isCorrect'],
              order: [['id', 'ASC']],
            },
          ],
        },
      ],
    });

    if (!quizz)
      return res.status(404).json({
        success: false,
        message: `with ID ${id} Quizz not found`,
      });

    const questions_en = [];
    const questions_ru = [];
    const questions_am = [];

    quizz.Questions.sort((a, b) => a.id - b.id).map((question) => {
      const options_en = question.Options.map((e) => {
        return {
          title_en: e.title_en,
          isCorrect_en: e.isCorrect,
        };
      });
      const options_am = question.Options.map((e) => {
        return {
          title_am: e.title_am,
          isCorrect_am: e.isCorrect,
        };
      });
      const options_ru = question.Options.map((e) => {
        return {
          title_ru: e.title_ru,
          isCorrect_ru: e.isCorrect,
        };
      });
      questions_en.push({
        question_en: question.title_en,
        options_en: options_en,
      });
      questions_am.push({
        question_am: question.title_am,
        options_am: options_am,
      });
      questions_ru.push({
        question_ru: question.title_ru,
        options_ru: options_ru,
      });
    });

    quizz = {
      ...quizz.dataValues,
      questions_en,
      questions_ru,
      questions_am,
    };

    return res.status(200).json({ success: true, quizz });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const submitQuizz = async (req, res) => {
  try {
    const { user_id: userId } = req.user;

    const { quizzId, questionId, optionId } = req.body;

    await UserAnswersQuizz.destroy({
      where: { userId, testId: quizzId, questionId },
    });

    await UserAnswersQuizz.create({
      userId,
      testId: quizzId,
      questionId,
      optionId,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const finishQuizz = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { quizzId, isFinal, lessonId, courseId } = req.body;
    const userCourses = await UserCourses.findOne({
      where: { UserId: userId, GroupCourseId: courseId },
    });
    if (!lessonId) {
      let correctAnswers = await Quizz.findByPk(quizzId, {
        attributes: ['id'],
        include: [
          {
            model: Question,
            attributes: ['id'],
            include: [
              {
                model: Option,
                where: { isCorrect: true },
                attributes: ['id'],
              },
            ],
          },
        ],
      });

      correctAnswers = correctAnswers.Questions.map((e) => e.Options[0].id).sort(
        (a, b) => a.id - b.id,
      );

      const userAnswers = await UserAnswersQuizz.findAll({
        where: {
          testId: quizzId,
          userId,
        },
        attributes: ['optionId'],
        order: [['id', 'ASC']],
      });
      userAnswers.map((e) => {
        correctAnswers.push(e.optionId);
      });

      const point =
        (Math.round(
          ((correctAnswers.length - new Set(correctAnswers).size) /
            Math.ceil(correctAnswers.length / 2)) *
            100,
        ) *
          (10 / 2)) /
        100;

      await UserPoints.findOrCreate({
        where: {
          userId,
          quizzId,
          courseId,
          isFinal,
        },
        defaults: {
          quizzId,
          userId,
          correctAnswers: correctAnswers.length - new Set(correctAnswers).size,
          point,
          isFinal,
          courseId,
        },
      });

      userCourses.totalPoints = Math.ceil(userCourses.totalPoints + point);
      await userCourses.save();

      return res.json({ success: true });
    }
    const { maxPoints } = await Lesson.findByPk(lessonId);

    let correctAnswers = await Quizz.findByPk(quizzId, {
      attributes: ['id'],
      include: [
        {
          model: Question,
          attributes: ['id'],
          include: [
            {
              model: Option,
              where: { isCorrect: true },
              attributes: ['id'],
            },
          ],
        },
      ],
    });
    console.log(correctAnswers);

    correctAnswers = correctAnswers.Questions.map((e) => e.Options[0].id).sort(
      (a, b) => a.id - b.id,
    );

    const userAnswers = await UserAnswersQuizz.findAll({
      where: {
        testId: quizzId,
        userId,
      },
      attributes: ['optionId'],
      order: [['id', 'ASC']],
    });

    userAnswers.map((e) => {
      correctAnswers.push(e.optionId);
    });
    // console.log(correctAnswers,correctAnswers.length - new Set(correctAnswers).size);

    const point =
      (Math.round(
        ((correctAnswers.length - new Set(correctAnswers).size) /
          Math.ceil(correctAnswers.length / 2)) *
          100,
      ) *
        (maxPoints / 2)) /
      100;
    await UserPoints.findOrCreate({
      where: {
        userId,
        quizzId,
        courseId,
      },
      defaults: {
        quizzId,
        userId,
        point: Math.round(point),
        correctAnswers: correctAnswers.length - new Set(correctAnswers).size,
        isFinal,
        courseId,
      },
    });
    userCourses.totalPoints = Math.ceil(userCourses.totalPoints + point);
    await userCourses.save();

    const userLesson = await UserLesson.findOne({
      where: { UserId: userId, GroupCourseId: courseId, LessonId: lessonId },
    });
    userLesson.points = Math.round(userLesson.points + point);
    await userLesson.save();
    return res.json({
      point,
      correctAnswers: correctAnswers.length - new Set(correctAnswers).size,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getAll = async (req, res) => {
  try {
    const quizzes = await Quizz.findAll({
      attributes: ['id', ['title_en', 'title']],
    });

    return res.json(quizzes);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteQuizz = async (req, res) => {
  try {
    const { id } = req.params;

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
    } = req.body;

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

    await Question.destroy({
      where: {
        quizzId: id,
      },
    });

    await Promise.all(
      questions.map(async (question, i) => {
        const createdQuestion = await Question.create({
          title_en: question.title_en,
          title_am: question.title_am,
          title_ru: question.title_ru,
          quizzId: id,
        });

        const options = question.options.map((option) => ({
          title_en: option.title_en,
          title_ru: option.title_ru,
          title_am: option.title_am,
          isCorrect: option.isCorrect,
          questionId: createdQuestion.id,
        }));

        await Option.bulkCreate(options);
      }),
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getUserAnswers = async (req, res) => {
  try {
    const { quizzId, courseId, isFinal } = req.body;

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
};
