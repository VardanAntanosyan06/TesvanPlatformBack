const { GroupCourses } = require("../models");
const { CoursesContents } = require("../models");
const { Levels } = require("../models");
const { CourseType } = require("../models");
const { Format } = require("../models");
const { Users } = require("../models");
const { Op, where } = require("sequelize");
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

const getCoursesByLFilter = async (req, res) => {
  try {
    let {
      level,
      minPrice = 0,
      maxPrice = 1000000000000000,
      format,
      isDiscount = false,
      language = "en",
      page = 1,
      limit = 9,
    } = req.query;
    format = format.split("_");
    level = level.split("_");

    if (!["en", "ru", "am"].includes(language)) {
      return res
        .status(403)
        .json({ message: "The language must be am, ru, or en." });
    }
    if (!(level && format && language))
      return res.status(403).json({
        message: "level, format, isDiscount and language is requred values",
      });

    let type = { [Op.gt]: 0 };
    !isDiscount && (type = { [Op.lte]: 0 });

    const months = { am: "ամիս", ru: "месяц", en: "months" };
    const days = { am: "օր", ru: "день", en: "days" };

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
    const courseCount = await GroupCourses.count({
      where: {
        sale: type,
      },include: [
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
            price: {
              [Op.gte]: minPrice,
              [Op.lte]: maxPrice,
            },
          },
        },
      ],
    });

    let Courses = await GroupCourses.findAll({
      where: {
        sale: type,
      },
      offset: page === 1 ? 0 : (page - 1) * limit,
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
            price: {
              [Op.gte]: minPrice,
              [Op.lte]: maxPrice,
            },
          },
          attributes: { exclude: ["id", "language", "courseId"] },
          // include: [Levels],
        },
      ],
      order: [["bought", "DESC"]],
      attributes: { exclude: ["id", "createdAt", "updatedAt"] },
    });

    if (Courses.length === 0)
      return res
        .status(403)
        .json({ message: "No data was found for this filter." });

    Courses = Courses.map((e) => CircularJSON.stringify(e));

    const newCourses = Courses.map((_course) => {
      let course = JSON.parse(_course);
      course = {
        ...course,
        title: course.CoursesContents[0].title,
        description: course.CoursesContents[0].description,
        courseType: groups[course.CoursesContents[0].courseType],
        lessonType: formats[course.CoursesContents[0].lessonType],
        level: levels[course.CoursesContents[0].level],
        price: course.CoursesContents[0].price,
        courseStartDate: moment(course.startDate).format("ll"),
        courseDate:
          moment().diff(course.startDate, "months") > 0
            ? moment().diff(course.startDate, "months") + " " + months[language]
            : moment().diff(course.startDate, "days") + " " + days[language],
      };

      delete course.CoursesContents;
      return course;
    });
    const pagination = Math.ceil(courseCount / limit);

    return res.status(200).json({ pagination,Courses:newCourses });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllCourses,
  getCoursesByLFilter,
};
