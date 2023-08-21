const { GroupCourses } = require("../models");
const { CoursesContents } = require("../models");
const { Op } = require("sequelize");

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
    if (language == "am") {
      months = "ամիս";
      days = "օր";
    } else if (language == "ru") {
      months = "месяц";
      days = "день";
    } else {
      months = "months";
      days = "days";
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

const getCoursesByLimit = async (req, res) => {
  try {
    const { page = 1, limit = 9, language = "en" } = req.query;
    if (!["en", "ru", "am"].includes(language)) {
      return res
        .status(403)
        .json({ message: "The language must be am, ru, or en." });
    }
    const allCourses = await GroupCourses.findAll({
      include: [
        {
          model: CoursesContents,
          where: { language },
          attributes: { exclude: ["id", "language", "courseId"] },
        },
      ],
      attributes: { exclude: ["id", "createdAt", "updatedAt"] },
    });
    const pagination = Math.ceil(allCourses.length / limit);
    if (page > pagination) return res.status(403).json({ message: "no data" });
    const limitedCourses = await GroupCourses.findAll({
      offset: page === 1 ? 0 : (page - 1) * limit,
      limit,
      include: [
        {
          model: CoursesContents,
          where: { language },
          attributes: { exclude: ["language", "courseId"] },
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    return res.json({ pagination, limitedCourses });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllCourses,
  getCoursesByLimit,
};
