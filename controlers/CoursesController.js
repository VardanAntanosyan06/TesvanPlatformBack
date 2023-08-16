const { GroupCourses } = require("../models");
const { CoursesContents } = require("../models");
const moment = require("moment");


const getAllCourses = async (req, res) => {
  
  try {
    const { language } = req.query;
    let months = "months"
    let days = "days"

    if (!["en", "ru", "am"].includes(language)) {
      return res
        .status(404)
        .json({ message: "The language must be am, ru, or en." });
    }
    if(language=="am"){
      months = "ամիս"
      days = "օր"
    }else if(language=="ru"){
      months = "месяц"
      days = "день"
    }else{
       months = "months"
       days = "days"
    }
    let Courses = await GroupCourses.findAll({
      include: [
        {
          model: CoursesContents,
          where: { language },
          attributes: { exclude: ["id", "language",'courseId'] },
        },
      ],
      order: [
        ['bought', 'DESC'],
    ],
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

module.exports = {
  getAllCourses,
};
