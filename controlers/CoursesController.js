const { GroupCourses } = require("../models");
const { CoursesContents } = require("../models");
const { UserCourses } = require("../models");
const { Levels } = require("../models");
const { CourseType } = require("../models");
const { Format } = require("../models");
const { Users } = require("../models");
const { CourseProgram } = require("../models");
const { Trainer } = require("../models");
const { UserLesson } = require("../models");
const { Lesson } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("sequelize");
const CircularJSON = require("circular-json");

const moment = require("moment");

const getAllCourses = async (req, res) => {
  try {
    const { language } = req.query;
    let months = "months";
    let days = "days";

    if (!["en", "ru", "am"].includes(language)) {
      return res
        .status(403)
        .json({ message: "The language must be am, ru, or en." });
    }

    switch (language) {
      case "am":
        months = "ամիս";
        days = "օր";
        break;
      case "ru":
        months = "месяц";
        days = "день";
        break;
      default:
        months = "months";
        days = "days";
        break;
    }
    let Courses = await GroupCourses.findAll({
      include: [
        {
          model: CoursesContents,
          where: { language },
          attributes: { exclude: ["id", "language", "courseId"] },
        },
      ],
      order: [["bought", "DESC"]],
      attributes: { exclude: ["id", "createdAt", "updatedAt"] },
    });

    Courses = Courses.map((e) => {
      return {
        course: e,
        courseStartDate: moment(e.startDate).format("ll"),
        courseDate:
          moment().diff(e.startDate, "months") > 0
            ? moment().diff(e.startDate, "months") + " " + months
            : moment().diff(e.startDate, "days") + " " + days,
      };
    });
    return res.status(200).json({ Courses });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getCoursesByFilter = async (req, res) => {
  try {
    let {
      level,
      minPrice = 0,
      maxPrice = 1000000000000000,
      format,
      isDiscount,
      language = "en",
      limit = null,
      order = "popularity",
    } = req.query;
    format = format.split("_");
    level = level.split("_");
    if (!["en", "ru", "am"].includes(language)) {
      return res
        .status(403)
        .json({ message: "The language must be am, ru, or en." });
    }
    if (!["popularity", "newest", "lowToHigh", "highToLow"].includes(order)) {
      return res.status(403).json({
        message:
          "The Order must be popularity or newest lowToHigh or highToLow.",
      });
    }
    if (!(level && format && language))
      return res.status(403).json({
        message: "level, format, isDiscount and language is requred values",
      });

    let type = { [Op.gte]: 0 };
    if (isDiscount === "true") {
      type = { [Op.gt]: 0 };
    }
    const months = { am: "ամիս", ru: "месяц", en: "months" };
    const days = { am: "օր", ru: "день", en: "days" };
    const orderTypes = {
      popularity: ["bought", "DESC"],
      newest: ["createdAt", "DESC"],
    };

    const levels = {};
    const getLevels = await Levels.findAll({
      attributes: [language, "slug"],
    });
    getLevels.map((e) => {
      levels[e.slug] = e[language];
    });

    const formats = {};
    const getFormats = await Format.findAll({
      attributes: [language, "slug"],
    });
    getFormats.map((e) => {
      formats[e.slug] = e[language];
    });

    const groups = {};
    const getGroups = await CourseType.findAll({
      attributes: [language, "slug"],
    });
    getGroups.map((e) => {
      groups[e.slug] = e[language];
    });
    let Courses = await GroupCourses.findAll({
      where: {
        sale: type,
      },
      limit,
      include: [
        {
          model: CoursesContents,
          where: {
            language,
            level: {
              [Op.in]: level,
            },
            lessonType: {
              [Op.in]: format,
            },
          },
          attributes: { exclude: ["id", "language", "courseId"] },
          include: [Levels],
        },
      ],
      order: orderTypes[order] ? [orderTypes[order]] : [["id", "ASC"]],
      attributes: { exclude: ["updatedAt"] },
    });

    Courses = Courses.map((e) => CircularJSON.stringify(e));

    let newCourses = Courses.map((_course) => {
      let course = JSON.parse(_course);
      course = {
        ...course,
        title: course.CoursesContents[0].title,
        description: course.CoursesContents[0].description,
        courseType: groups[course.CoursesContents[0].courseType],
        lessonType: formats[course.CoursesContents[0].lessonType],
        level: levels[course.CoursesContents[0].level],
        price: course.CoursesContents[0].price,
        saledValue:
          course.sale > 0
            ? Math.round(course.CoursesContents[0].price * course.sale) / 100
            : course.CoursesContents[0].price,
        courseStartDate: moment(course.startDate).format("ll"),
        courseDate:
          moment().diff(course.startDate, "months") > 0
            ? moment().diff(course.startDate, "months") + " " + months[language]
            : moment().diff(course.startDate, "days") + " " + days[language],
      };

      delete course.CoursesContents;
      delete course.sale;
      return course;
    });
    if (order === "highToLow")
      newCourses = newCourses.sort((a, b) => b.saledValue - a.saledValue);
    if (order === "lowToHigh")
      newCourses = newCourses.sort((a, b) => a.saledValue - b.saledValue);
    newCourses = newCourses.filter(
      (e) => e.saledValue >= minPrice && e.saledValue <= maxPrice
    );
    if (newCourses.length === 0)
      return res
        .status(403)
        .json({ message: "No data was found for this filter." });

    return res.status(200).json({ Courses: newCourses });
  } catch (error) {
    console.log(error);
  }
};

const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;
    const course = await GroupCourses.findOne({
      where: { id },
      include: [
        { model: CoursesContents, where: { language } },
        { model: CourseProgram, where: { language } },
      ],
    });

    if (!course) {
      return res.status(500).json({ message: "Course not found." });
    }

    const trainers = await Trainer.findAll({
      where: {
        id: {
          [Op.in]: course.trainers,
        },
      },
      attributes: ["fullName", "img", "profession"],
    });

    let { CoursePrograms: program, ...data } = course.dataValues;

    res.send({ ...data, program, trainers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const like = async (req, res) => {
  try {
    let { courseId } = req.params;
    const { user_id: id } = req.user;

    courseId = +courseId;

    const user = await Users.findOne({ where: { id } });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.likedCourses && user.likedCourses.includes(courseId)) {
      user.likedCourses = user.likedCourses.filter((id) => id !== courseId);
    } else {
      user.likedCourses = [...user.likedCourses, courseId];
    }

    await user.save();

    res.send({ courses: user.likedCourses });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const buy = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { user_id: id } = req.user;

    const user = await Users.findOne({ where: { id } });

    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }

    await UserCourses.create({
      UserId: id,
      GroupCourseId: courseId,
    });

    let course = await GroupCourses.findOne({
      where: { id: courseId },
      include: [{ model: Lesson, as: "lessons" }],
    });

    course.lessons.forEach((lesson) => {
      UserLesson.create({
        UserId: id,
        GroupCourseId: courseId,
        LessonId: lesson.dataValues.id,
      });
    });

    res.send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getUserCourses = async (req, res) => {
  try {
    const { user_id: id } = req.user;
    if (!id) {
      return res.status(500).json({ message: "User not found" });
    }

    const courses = await UserCourses.findAll({
      where: { UserId: id },
      include: [
        {
          model: GroupCourses,
        },
      ],
    });

    res.send({ courses });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getUserCourse = async (req, res) => {
  try {
    const { user_id: id } = req.user;
    const { courseId } = req.params;
    // const { language } = req.query;

    if (!id) {
      return res.status(500).json({ message: "User not found" });
    }

    let course = await UserCourses.findOne({
      where: { UserId: id, GroupCourseId: courseId },
      include: [
        {
          model: GroupCourses,
        },
      ],
    });

    if (!course) {
      return res.status(500).json({ message: "Course not found" });
    }

    // let lessons = await UserLesson.findAll({
    //   where: { UserId: id, GroupCourseId: courseId },
    //   attributes: ["points"],
    //   include: [
    //     {
    //       model: Lesson,
    //       attributes: [
    //         [`title_${language}`, "title"],
    //         [`description_${language}`, "description"],
    //         "maxPoints",
    //         "courseId",
    //         "id",
    //         "number",
    //       ],
    //     },
    //   ],
    // });

    // lessons = lessons.map((lesson) => {
    //   return {
    //     points: lesson.points,
    //     ...lesson.dataValues.Lesson.dataValues,
    //   };
    // });

    course = {
      totalPoints: course.dataValues.totalPoints,
      takenQuizzes: course.dataValues.takenQuizzes,
      ...course.dataValues.GroupCourse.dataValues,
      // lessons,
    };

    res.send({ course });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  getAllCourses,
  getCoursesByFilter,
  getOne,
  like,
  buy,
  getUserCourses,
  getUserCourse,
};
