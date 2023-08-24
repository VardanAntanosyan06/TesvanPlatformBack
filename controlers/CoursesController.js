const { GroupCourses } = require("../models");
const { CoursesContents } = require("../models");
const { Levels } = require("../models");
const { Users } = require("../models");
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
    let months = "months";
    let days = "days";

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
    let limitedCourses = await GroupCourses.findAll({
      offset: page === 1 ? 0 : (page - 1) * limit,
      limit,
      include: [
        {
          model: CoursesContents,
          where: { language },
          attributes: { exclude: ["language", "courseId"] },
        },
      ],
      order:[
        ['bought',"DESC"]
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    limitedCourses = limitedCourses.map((e) => {
      return {
        course: e,
        courseStartDate: moment(e.startDate).format("ll"),
        courseDate:
          moment().diff(e.startDate, "months") > 0
            ? moment().diff(e.startDate, "months") + " " + months
            : moment().diff(e.startDate, "days") + " " + days,
      };
    });
    return res.json({ pagination, limitedCourses });
  } catch (error) {
    console.log(error);
  }
};

const getCoursesByLFilter = async (req, res) => {
  try {
    const { level, minPrice=0, maxPrice=1000000000000000, format, isDiscount=false, language="en" } =
      req.query;
      if(!(level && format && language)) return res.status(403).json({message:"level, format, isDiscount and language is requred values"});
      if((!["Online", "Offline", "Hybrid"].includes(format)) && !["Beginner", "Intermediate", "Advanced"].includes(level)) return res.status(403).json({message:"Level must be 'Beginner', 'Intermediate, or 'Advanced, format must be Online, Offline, or 'Hybrid, and isDiscount must be true, or false."})
    let type = { [Op.gt]: 0 };
    !isDiscount && (type = { [Op.lte]: 0 });

    const Courses = await GroupCourses.findAll({
      where: {
        sale: type,
      },
      include: [
        {
          model: CoursesContents,
          where: {
            language,
            level,
            lessonType: format,
            price: {
              [Op.gte]: minPrice,
              [Op.lte]: maxPrice,
            },
          },
          attributes: { exclude: ["id", "language", "courseId"] },
          include:[Levels]
        },
      ],
      order: [["bought", "DESC"]],
      attributes: { exclude: ["id", "createdAt", "updatedAt"] },
    });
    if(Courses.length===0) return res.status(403).json({message:"No data was found for this filter."})
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
  }
};

module.exports = {
  getAllCourses,
  getCoursesByLimit,
  getCoursesByLFilter,
};
