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
      questions_en,
      questions_ru,
      questions_am,
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

    questions_en.map((question, i) => {
      Question.create({
        title_en: question.question_en,
        title_ru: questions_ru[i].question_ru,
        title_am: questions_am[i].question_am,
        quizzId,
      }).then((data) => {
        question.options.map((option, optionIndex) => {
          console.log(questions_ru[i].options[optionIndex]);
          Option.create({
            title_en: option.option_en,
            title_ru: questions_ru[i].options[optionIndex].option_ru,
            title_am: questions_am[i].options[optionIndex].option_am,
            isCorrect: option.isCorrect_en,
            questionId: data.id,
          });
        });
        // console.log(question);
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
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
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
      attributes: ['id', [`title_${language}`, 'title'],[`description_${language}`, 'description'],'time'],
      include: [
        {
          model: Question,
          attributes: ['id', 'quizzId', [`title_${language}`, 'title'],'title_ru','title_en','title_am',],
          include: {
            model: Option,
            attributes: ['id', [`title_${language}`, 'title'],'title_ru','title_en','title_am'],
            required: true,
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
          points,
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
        point,
        isFinal,
        courseId,
      },
    });
    userCourses.totalPoints = Math.ceil(userCourses.totalPoints + point);
    await userCourses.save();
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

    // Delete the quiz itself
    Quizz.destroy({ where: { id } });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const updateQuizz = async (req, res) => {
  try {
    const {
      id,
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      time,
      percent,
      questions_en,
      questions_ru,
      questions_am,
      lessonId,
      courseId,
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
        percent,
      },
      { where: { id } },
    );

    await Question.destroy({
      where: {
        quizzId: id,
      },
    });

    questions_en.map((question, i) => {
      Question.create({
        title_en: question.question_en,
        title_ru: questions_ru[i].question_ru,
        title_am: questions_am[i].question_am,
        quizzId: id,
      }).then((data) => {
        console.log(question);
        question.options_en.map((option, optionIndex) => {
          Option.destroy({
            where: {
              questionId: data.id,
            },
          });
          Option.create({
            title_en: option.option_en,
            title_ru: questions_ru[i].options_ru[optionIndex].option_ru,
            title_am: questions_am[i].options_am[optionIndex].option_am,
            isCorrect: option.isCorrect_en,
            questionId: data.id,
          });
        });
        // console.log(question);
      });
    });

    res.status(200).json({ success: true });
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
  deleteQuizz,
  updateQuizz,
};
