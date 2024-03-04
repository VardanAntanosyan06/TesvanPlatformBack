const {
  GroupCourses,
  Tests,
  UserTests,
  CoursesPerLessons,
  Groups,
} = require("../models");

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
const {v4} = require("uuid")
const moment = require("moment");
const path = require("path")

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

const getCourseTitles = async (req, res) => {
  try {
    const { language } = req.query;
    let months = "months";
    let days = "days";

    if (!["en", "ru", "am"].includes(language)) {
      return res
        .status(403)
        .json({ message: "The language must be am, ru, or en." });
    }

    let Courses = await GroupCourses.findAll({
      include: [
        {
          model: CourseProgram,
          where: { language },
          attributes: ["title"],
        },
      ],
      order: [["id", "ASC"]],
      attributes: ["id"],
    });
    Courses = Courses.map((item) => {
      return {
        id: item.id,
        title: item.CoursePrograms[0].title,
      };
    });
    return res.status(200).json(Courses);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;

    const groups = await Groups.findOne({ where: { id } });

    console.log(groups);

    let course = await GroupCourses.findOne({
      where: { id },
      include: [{ model: CoursesContents, where: { language } }],
    });
    if (!course) {
      return res.status(500).json({ message: "Course not found." });
    }

    const lessonsCount = await CoursesPerLessons.count({
      where: { courseId: id },
    });
    const duration = moment(groups.endDate).diff(
      moment(groups.startDate),
      "days"
    );

    const trainers = await Trainer.findAll({
      where: { courseId: id },
      attributes: ["fullName", "img", "profession"],
    });

    course = {
      ...course.dataValues,
      startDate: groups.startDate,
      duration,
      lessonsCount,
      trainers: trainers,
    };
    console.log(trainers.length);
    res.send(course);
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
      return res.status(404).json({ message: "User not found" });
    }
    const courseBought = await UserCourses.findOne({
      where: { UserId: id, GroupCourseId: courseId },
    });

    if (courseBought) return res.status(403).json({ success: false });

    await UserCourses.create({
      UserId: id,
      GroupCourseId: courseId,
    });

    let course = await GroupCourses.findOne({
      where: { id: courseId },
      include: [{ model: Lesson }],
    });

    course.Lessons.forEach((lesson) => {
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

const createTest = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { courseId } = req.body;

    const tests = await Tests.findAll({ where: { courseId } });

    tests.map((e) => {
      UserTests.findOrCreate({
        where: { userId, testId: e.id },
        defaults: {
          userId,
          testId: e.id,
          status: "not passed",
          point: 0,
        },
      });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getUserCourses = async (req, res) => {
  try {
    const { user_id: id } = req.user;
    const { language } = req.query;
    if (!id) {
      return res.status(500).json({ message: "User not found" });
    }

    let courses = await UserCourses.findAll({
      where: { UserId: id },
      attributes: ["id", ["UserId", "userId"]],
      include: [
        {
          model: GroupCourses,
          attributes: ["id", "startDate"],
          include: [
            {
              model: CoursesContents,
              where: { language },
              attributes: ["title", "description"],
            },
          ],
        },
      ],
    });
    courses = courses.map((e) => {
      e = e.toJSON();
      delete e.dataValues;

      const formattedDate = new Date(
        e.GroupCourse.startDate
      ).toLocaleDateString("am-AM", {
        month: "2-digit",
        day: "2-digit",
      });

      e["groupCourseId"] = e.GroupCourse.id;
      e["startDate"] = formattedDate.replace("/", ".");
      e["title"] = e.GroupCourse.CoursesContents[0].title;
      e["description"] = e.GroupCourse.CoursesContents[0].description;
      e["percent"] = 0;
      delete e.GroupCourse;
      return e;
    });
    return res.send({ courses });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getUserCourse = async (req, res) => {
  try {
    const { user_id: id } = req.user;
    const { courseId } = req.params;
    const { language } = req.query;

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
    // const allLessons = await Lesson.findAll({
    //   where: { courseId },
    //   attributes: [
    //     [`title_${language}`, "title"],
    //     [`description_${language}`, "description"],
    //     "maxPoints",
    //     "courseId",
    //     "id",
    //     "number",
    //     "isOpen"
    //   ],
    //   order: [["id", "ASC"]],
    // });

    let lessons = await Lesson.findAll({
      where: { courseId },
      // include: [
      // {
      // model: ,
      attributes: [
        [`title_${language}`, "title"],
        [`description_${language}`, "description"],
        "maxPoints",
        "courseId",
        "id",
        "number",
        "isOpen",
      ],
      // },
      // ],
      order: [["id", "ASC"]],
    });

    // Map lesson ids from lessons
    // const lessonIds = lessons.map((lesson) => lesson.Lesson.id);

    // // Check if each lesson in allLessons is open or not
    // const lessonsWithStatus = allLessons.map((lesson) => {
    //   const isOpen = lessonIds.includes(lesson.id);
    //   return {
    //     ...lesson.get(),
    //     isOpen,
    //   };
    // });

    return res.json(lessons);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const createCourse = async (req, res) => {
  try {
    let {
      language,
      title,
      description,
      courseType,
      lessonType,
      whyThisCourse,
      level,
      levelDescriptions,
      lessons,
      trainers
    } = req.body;
    
    let {img,trainersImages} = req.files;

    const imgType = img.mimetype.split("/")[1];
    const imgFileName = v4() + "." + imgType;
    img.mv(path.resolve(__dirname, "..", "static", imgFileName));
    const { id: courseId } = await GroupCourses.create({ img:imgFileName });
    
    trainers = JSON.parse(trainers)
    if (!Array.isArray(lessons)) lessons = [lessons];
    if(!Array.isArray(trainersImages))trainersImages = [trainersImages] 
    await CourseProgram.create({
      courseId,
      language,
      title,
      description,
      courseType,
      lessonType,
      whyThisCourse,
      level,
      levelDescriptions,
    });

    lessons.map((e) => {
      CoursesPerLessons.create({
        courseId,
        lessonId: e,
      });
    });
    trainers.map((e,i)=>{
      const type = trainersImages[i].mimetype.split("/")[1];
      const fileName = v4() + "." + type;
      trainersImages[i].mv(path.resolve(__dirname, "..", "static", fileName));

      Trainer.create({
        fullName: e.fullName,
        img: fileName,
        profession: e.profession,
        courseId,
      })
    });
    res.status(200).json({ success: true });
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

    let Courses = await Groups.findAll({
      include: [
        {
          model: GroupCourses,
          require: true,
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
        },
      ],
      // order: orderTypes[order] ? [orderTypes[order]] : [["id", "ASC"]],
      attributes: ["id", ["name", "title"]],
    });

    Courses = Courses.map((e) => {
      e = e.toJSON();
      delete e.dataValues;

      e.img = e.GroupCourse.img;
      e.description = e.GroupCourse.CoursesContents[0].description;
      e.courseType = e.GroupCourse.CoursesContents[0].courseType;
      e.lessonType = e.GroupCourse.CoursesContents[0].lessonType;
      e.level = e.GroupCourse.CoursesContents[0].level;
      e.courseStartDate = moment().format("ll");
      (e.courseDate =
        moment().diff(new Date().toISOString(), "months") > 0
          ? moment().diff(new Date().toISOString(), "months") +
            " " +
            months[language]
          : moment().diff(new Date().toISOString(), "days") +
            " " +
            days[language]),
        (e.price = 75);
      (e.saledValue =
        e.price > 0 ? e.price - Math.round(e.price * 10) / 100 : e.price),
        (e.bought = 100);

      delete e.GroupCourse;
      return e;
    });

    return res.status(200).json({ Courses });
  } catch (error) {
    console.log(error.message);
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
  getCourseTitles,
  createTest,
  createCourse,
};
