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
} = require("../models");
const lessonsperquizz = require("../models/lessonsperquizz");
const { userSockets } = require("../userSockets");

const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { language } = req.query;
    const { user_id: userId } = req.user;

    let lessons = await UserLesson.findAll({
      where: { GroupCourseId: courseId, UserId: userId },
      attributes: ["points", "attempt"],
      include: [
        {
          model: Lesson,
          attributes: [
            "id",
            "courseId",
            "number",
            [`title_${language}`, "title"],
            [`description_${language}`, "description"],
            "maxPoints",
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
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getLessonTitles = async (req, res) => {
  try {
    const {language} = req.query;

    let lessons = await Lesson.findAll({
      attributes: ["id", ["title_en","title"]],
    });

    if (!lessons.length) {
      return res.status(403).json({
        message: "Lessons not found",
      });
    }

    return res.send(lessons);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;
    const { language } = req.query;

    let lesson = await UserLesson.findOne({
      where: { LessonId: id, UserId: userId },
      attributes: ["points", "attempt"],
      include: [
        {
          model: Lesson,
          attributes:[['title_en','title'],['description_en','description'],'maxPoints','htmlContent']          
        },
      ],
    });

    const quizzes = await LessonsPerQuizz.findOne({where:{
        lessonId:id
    },
    })
    if (!lesson) {
      return res.status(403).json({
        message: "Lessons not found or User doesn't have the lessons",
      });
    } 

    lesson = {
      points: lesson.points,
      pointsOfPercent: Math.round(
        (lesson.points * 100) / lesson.Lesson.maxPoints
      ),
      attempt: lesson.attempt,
      ...lesson.dataValues.Lesson.dataValues,
      quizzId:quizzes?.quizzId ? quizzes.quizzId :null
    };

    res.send(lesson);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getLessonForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;

    let lesson = await Lesson.findOne({
      where: {id },
      attributes:[['title_en','title'],['description_en','description'],'maxPoints','htmlContent']
    });

    if (!lesson) {
      return res.status(403).json({
        message: "Lessons not found or User doesn't have the lessons",
      });
    } 

    res.send(lesson);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
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
      return res
        .status(403)
        .json({ message: "Lesson not found or User doesn't have a lesson" });
    }

    let currentPoints = lesson.points;
    let collectedPoints;

    if (lesson.attempt === 1) {
      lesson.points = points;
      collectedPoints = points;
      lesson.attempt = lesson.attempt + 1;
    } else if (lesson.attempt === 2) {
      collectedPoints = points - 10;
      lesson.points =
        collectedPoints > currentPoints ? collectedPoints : currentPoints;
      lesson.attempt = lesson.attempt + 1;
    } else if (lesson.attempt === 3) {
      collectedPoints = points - 20;
      lesson.points =
        collectedPoints > currentPoints ? collectedPoints : currentPoints;
      lesson.attempt = lesson.attempt + 1;
    } else {
      return res.status(403).json({ message: "No more attempts" });
    }

    await lesson.save();

    res.send({ points: collectedPoints });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
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
      return res.status(404).json("lesson not found");
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
            title_en: "New Lesson",
            title_ru: "New Lesson",
            title_am: "New Lesson",
            description_en: "You have a new Lesson!",
            description_ru: "You have a new Lesson!",
            description_am: "You have a new Lesson!",
            type: "info",
          });
          const userSocket = userSockets.get(user.UserId);
          if (userSocket) {
            userSocket.emit("new-message", "New Message");
          }
        })
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
        })
      );
    }

    lesson.isOpen = !lesson.isOpen;
    lesson.save();
    return res.send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const createLesson = async (req, res) => {
  try {
    const { title_en, description_en, maxPoints,htmlContent  } = req.body;

    await Lesson.create({ title_en, description_en, maxPoints,htmlContent });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getAllLessons = async(req,res)=>{
  try {
    const lessons = await Lesson.findAll({
      attributes:['id','name']
    })

    return res.json(lessons)
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    await Lesson.destroy({ where:{id} });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { title_en, description_en,id,htmlContent} = req.body;

    await Lesson.update(
      { title_en, description_en,htmlContent },
      { where: { id } }
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};
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
  getLessonForAdmin
};
