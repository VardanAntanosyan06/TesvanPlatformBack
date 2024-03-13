const { Op } = require("sequelize");
const {
  Quizz,
  Option,
  Question,
  CoursesPerQuizz,
  UserAnswersQuizz,
  CoursesPerLessons,
  Lesson,
  LessonsPerQuizz
} = require("../models");
const lessonsperquizz = require("../models/lessonsperquizz");

const createQuizz = async (req, res) => {
  try {
    const { title, description, lessonId, courseId, time, percent, questions } =
      req.body;

    let { id: quizzId } = await Quizz.create({
      title_en: title,
      description_en: description,
      time,
      percent,
    });
    console.log(questions);
    questions.map((e) => {
      Question.create({
        title: e.question,
        quizzId,
      }).then((data) => {
        e.options.map((i) => {
          Option.create({
            questionId: data.id,
            title: i.option,
            isCorrect: i.isCorrect,
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
      });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// add time in models
const getQuizzes = async (req, res) => {
  try {
    const { id } = req.params;

    let quizz = await Quizz.findOne({
      where: { id },
      include: [
        {
          model: Question,
          include: {
            model: Option,
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

      const lesson = await LessonsPerQuizz.findOne({
        where:{quizzId:id},
        include:{
          model:Lesson,
          attributes:['id',['title_en','title']]
        }}) 

    quizz = {
      lesson:lesson.Lesson,
      time: 22,
      ...quizz.dataValues,
    };
    return res.status(200).json({ success: true, quizz });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
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
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const finishQuizz = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { quizzId } = req.params;

    let correctAnswers = await Quizz.findByPk(quizzId, {
      attributes: ["id"],
      include: [
        {
          model: Question,
          attributes: ["id"],
          include: [
            {
              model: Option,
              where: { isCorrect: true },
              attributes: ["id"],
            },
          ],
        },
      ],
    });
    correctAnswers = correctAnswers.Questions.map((e) => e.Options[0].id).sort(
      (a, b) => a.id - b.id
    );

    const userAnswers = await UserAnswersQuizz.findAll({
      where: {
        testId: quizzId,
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

    return res.json({
      point,
      correctAnswers: correctAnswers.length - new Set(correctAnswers).size,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getAll = async (req,res)=>{
  try {
      const quizzes = await Quizz.findAll({
        attributes:['id',['title_en','title']]
      })

      return res.json(quizzes)
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

const deleteQuizz = async (req, res) => {
  try {
    const {id} = req.params;
    
    const questions = await Question.findAll({ where: { quizzId:id } });
    
    for (const question of questions) {
      await Option.destroy({ where: { questionId: question.id } });
    }

    Question.destroy({ where: { quizzId:id } });

    // Delete the quiz itself
    Quizz.destroy({ where: { id } });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const updateQuizz = async (req, res) => {
  try {
    const { title, description, time, percent, questions,id } = req.body;
    
    await Quizz.update(
      {
        title_en: title,
        description_en: description,
        time,
        percent,
      },
      { where: { id } }
    );

    await Question.destroy({ where: { quizzId:id } });

    for (const e of questions) {
      const question = await Question.create({
        title: e.question,
        quizzId:id,
      });

      for (const i of e.options) {
        await Option.create({
          questionId: question.id,
          title: i.option,
          isCorrect: i.isCorrect,
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};


module.exports = {
  createQuizz,
  getQuizzes,
  submitQuizz,
  finishQuizz,
  getAll,
  deleteQuizz,
  updateQuizz
};
