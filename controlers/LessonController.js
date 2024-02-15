const {
  UserLesson,
  Lesson,
  Quizz,
  Question,
  Option,
  Video,
} = require("../models");

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
          attributes: [
            "id",
            "courseId",
            "number",
            [`title_${language}`, "title"],
            [`description_${language}`, "description"],
            "maxPoints",
          ],
          include: [
            // {
            //   model: Quizz,
            //   attributes: [
            //     [`title_${language}`, "title"],
            //     [`description_${language}`, "description"],
            //   ],
            //   as: "quizz",
            //   include: [
            //     {
            //       model: Question,
            //       as: "questions",
            //       include: [{ model: Option, as: "options" }],
            //     },
            //   ],
            // },
            {
              model: Video,
              as: "video",
              attributes: [
                "id",
                "url",
                [`title_${language}`, "title"],
                [`description_${language}`, "description"],
              ],
            },
          ],
        },
      ],
    });

    if (!lesson) {
      return res
        .status(403)
        .json({ message: "Lesson not found or User doesn't have a lesson" });
    }
    // console.log(lesson.points,);
    lesson = {  
      points: Math.round(lesson.points*100/lesson.Lesson.maxPoints),
      attempt: lesson.attempt,
      ...lesson.dataValues.Lesson.dataValues,
    };

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

module.exports = {
  getLessons,
  getLesson,
  submitQuizz,
};
