const {
  Tests,
  TestsQuizz,
  TestsQuizzOptions,
  UserAnswersTests,
  UserTests,
  Users,
} = require("../models");

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
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const createQuizz = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      language,
      type,
      time,
      percent,
      questions,
    } = req.body;

    let { id: testId } = await Tests.create({
      title,
      description,
      courseId,
      language,
      type,
      time,
      percent,
    });
    questions.map((e) => {
      TestsQuizz.create({
        title: e.question,
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
    return res.status(500).json({ message: "Something went wrong." });
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
      return res
        .status(403)
        .json({
          success: false,
          message: `with ID ${id} or language ${testLanguage} Test not found`,
        });

    return res.status(200).json({ success: true, test });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
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
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const finishCourse = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { testId } = req.params;

    let correctAnswers = await Tests.findByPk(testId, {
      attributes: ["id"],
      include: [
        {
          model: TestsQuizz,
          attributes: ["id"],
          include: [
            {
              model: TestsQuizzOptions,
              where: { isCorrect: true },
              attributes: ["id"],
            },
          ],
        },
      ],
    });

    correctAnswers = correctAnswers.TestsQuizzs.map(
      (e) => e.TestsQuizzOptions[0].id
    ).sort((a, b) => a.questionId - b.questionId);

    const userAnswers = await UserAnswersTests.findAll({
      where: {
        testId,
        userId,
      },
      attributes: ["optionId"],
      order: [["id", "ASC"]],
    });
    userAnswers.map((e) => {
      correctAnswers.push(e.optionId);
    });

    const point = Math.round(
      ((correctAnswers.length - new Set(correctAnswers).size) /
        Math.ceil(correctAnswers.length / 2)) *
        100
    );

    const data = await UserTests.findOne({
      where: { userId, testId },
    });

    data.status = point > 30 ? "passed" : "not passed",
    data.passDate =  new Date().toISOString(),
    data.point = point,
    await data.save();

    return res.json({
      point,
      correctAnswers: correctAnswers.length - new Set(correctAnswers).size,
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getUserTests = async (req, res) => {
  try {
    const { user_id: userId } = req.user;

    const tests = await UserTests.findAll({
      where: { userId },
      attributes: ["testId", "status", "passDate", "point"],

      include: [
        {
          model: Tests,
          attributes: ["title", "type", "description", "language"],
        },
      ],
    });

    return res.status(200).json({ success: true, tests });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getUsers = async (req, res) => {
  try {
    // const { user_id: userId } = req.user;

    const tests = await UserTests.findAll({
      // where: { userId },
      attributes: ["testId", "status", "passDate", "point"],
      include: [
        {
          model: Tests,
          attributes: ["title", "type", "description", "language"],
        },
      ],

      include: [
        {
          model: Users,
          attributes: ["firstName", "lastName", "image"],
        },
      ],
    });

    return res.status(200).json({ success: true, tests });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const findCourses = async (req, res) => {
  try {
    // const courses = await
  } catch (error) {}
};

const findAll = async (req, res) => {
  try {
    const task = await Model.findAll({ where: {} });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const update = async (req, res) => {
  try {
    const task = await Model.update({ where: {} });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const remove = async (req, res) => {
  try {
    const task = await Model.destroy({ where: {} });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  createQuizz,
  findTest,
  submitQuizz,
  finishCourse,
  getUserTests,
  getUsers,
};
