const {
  Tests,
  TestsQuizz,
  TestsQuizzOptions,
  UserAnswersTests,
  UserTests,
  Users,
} = require('../models');

const Sequelize = require('sequelize');

const createTest = async (req, res) => {
  try {
    const {
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      courseId,
    } = req.body;

    const task = await Tests.create({
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      courseId,
      type: 'Group',
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const createQuizz = async (req, res) => {
  try {
    const { title, description, courseId, language, type, time, percent, questions } = req.body;

    let { id: testId } = await Tests.create({
      title,
      description,
      courseId,
      language,
      type,
      time,
      percent,
      type: 'Group',
    });
    questions.map((e) => {
      TestsQuizz.create({
        question: e.question,
        testId,
        language,
      }).then((data) => {
        e.options.map((i) => {
          TestsQuizzOptions.create({
            questionId: data.id,
            option: i.option,
            isCorrect: i.isCorrect,
          });
        });
      });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const findTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { testLanguage } = req.query;

    const test = await Tests.findOne({
      where: { id, language: testLanguage },
      include: [{ model: TestsQuizz, include: [TestsQuizzOptions] }],
    });

    if (!test)
      return res.status(403).json({
        success: false,
        message: `with ID ${id} or language ${testLanguage} Test not found`,
      });

    return res.status(200).json({ success: true, test });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const submitQuizz = async (req, res) => {
  try {
    const { user_id: userId } = req.user;

    const { testId, questionId, optionId } = req.body;

    await UserAnswersTests.destroy({
      where: { userId, testId, questionId },
    });

    await UserAnswersTests.create({
      userId,
      testId,
      questionId,
      optionId,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const finishCourse = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { testId } = req.params;

    let correctAnswers = await Tests.findByPk(testId, {
      attributes: ['id'],
      include: [
        {
          model: TestsQuizz,
          attributes: ['id'],
          include: [
            {
              model: TestsQuizzOptions,
              where: { isCorrect: true },
              attributes: ['id'],
            },
          ],
        },
      ],
    });

    correctAnswers = correctAnswers.TestsQuizzs.map((e) => e.TestsQuizzOptions[0].id).sort(
      (a, b) => a.questionId - b.questionId,
    );

    const userAnswers = await UserAnswersTests.findAll({
      where: {
        testId,
        userId,
      },
      attributes: ['optionId'],
      order: [['id', 'ASC']],
    });
    userAnswers.map((e) => {
      correctAnswers.push(e.optionId);
    });

    const point = Math.round(
      ((correctAnswers.length - new Set(correctAnswers).size) /
        Math.ceil(correctAnswers.length / 2)) *
        100,
    );

    const data = await UserTests.findOne({
      where: { userId, testId },
    });

    (data.status = point > 30 ? 'passed' : 'not passed'),
      (data.passDate = new Date().toISOString()),
      (data.point = point),
      await data.save();

    return res.json({
      point,
      correctAnswers: correctAnswers.length - new Set(correctAnswers).size,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};
const getUserTests = async (req, res) => {
  try {
    const { user_id: userId } = req.user;

    const tests = await UserTests.findAll({
      where: { userId },
      include: [
        {
          model: Tests,
          // attributes:[""m"title","description","language","time","percent"]
        },
      ],
    });

    // Filter tests where language is "en" and add amId and ruId based on UUID
    const filteredTests = tests
      .filter((test) => test.language === 'en')
      .map((test) => {
        const amTest = tests.find((t) => t.language === 'am' && t.Test.uuid === test.Test.uuid);
        const ruTest = tests.find((t) => t.language === 'ru' && t.Test.uuid === test.Test.uuid);
        return {
          test: test.Test,
          status: test.status,
          point: test.point,
          passDate: test.passDate,
          am: amTest ? amTest.id : null,
          ru: ruTest ? ruTest.id : null,
        };
      });

    return res.status(200).json({ success: true, tests: filteredTests });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};
const getUsers = async (req, res) => {
  try {
    // const { user_id: userId } = req.user;

    const tests = await UserTests.findAll({
      // where: { userId },
      attributes: ['testId', 'status', 'passDate', 'point'],
      include: [
        {
          model: Tests,
          attributes: ['title', 'type', 'description', 'language'],
        },
      ],

      include: [
        {
          model: Users,
          attributes: ['firstName', 'lastName', 'image'],
        },
      ],
    });

    return res.status(200).json({ success: true, tests });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const findCourses = async (req, res) => {
  try {
    // const courses = await
  } catch (error) {}
};

const findAll = async (req, res) => {
  try {
    let test = await Tests.findAll({
      attributes: {
        // include: [[Sequelize.fn('COUNT', Sequelize.col('TestsQuizzes.id')), 'quizzCount']]
      },
      // include: [TestsQuizz],
      order: [['id', 'DESC']],
    });

    const testsWithCounts = await Promise.all(
      test.map(async (test) => {
        // Fetch quizzes count for the test
        const quizzesCount = await TestsQuizz.count({
          where: { testId: test.id },
        });

        // Fetch users count for the test
        const usersCount = await UserTests.count({
          where: { testId: test.id },
        });

        // Return an object with test data and counts
        return {
          ...test.dataValues,
          quizzesCount: quizzesCount,
          usersCount: usersCount,
        };
      }),
    );

    return res.send(testsWithCounts);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, time, percent, questions, lessonId } = req.body;

    // Update the test details
    console.log(time);
    await Tests.update(
      {
        title: title,
        description: description,
        time,
        percent,
      },
      { where: { id } },
    );

    await TestsQuizz.destroy({ where: { testId: id } });

    for (const e of questions) {
      const question = await TestsQuizz.create({
        question: e.question,
        testId: id,
      });

      // Create options for the current question
      for (const i of e.options) {
        await TestsQuizzOptions.create({
          questionId: question.id,
          option: i.option,
          isCorrect: i.isCorrect,
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Tests.findByPk(id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found.' });
    }

    await Tests.destroy({ where: { id } });

    await TestsQuizz.destroy({ where: { testId: id } });
    await TestsQuizzOptions.destroy({ where: { questionId: id } });

    return res.status(200).json({ success: true, message: 'Test deleted successfully.' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

module.exports = {
  createQuizz,
  findTest,
  submitQuizz,
  finishCourse,
  getUserTests,
  getUsers,
  createTest,
  updateTest,
  deleteTest,
  findAll,
};
