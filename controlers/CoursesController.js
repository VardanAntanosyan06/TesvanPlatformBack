const {
  GroupCourses,
  Tests,
  UserTests,
  CoursesPerLessons,
  Groups,
  GroupsPerUsers,
  levelDescription,
  PaymentWays,
  CoursesPerQuizz,
  Quizz,
  IndividualCourses,
  Calendar,
} = require('../models');

const { CoursesContents } = require('../models');
const { UserCourses } = require('../models');
const { Levels } = require('../models');
const { CourseType } = require('../models');
const { Format } = require('../models');
const { Users } = require('../models');
const { CourseProgram } = require('../models');
const { Trainer } = require('../models');
const { UserLesson } = require('../models');
const { Lesson } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const CircularJSON = require('circular-json');
const { v4 } = require('uuid');
const moment = require('moment');
const path = require('path');
const { group } = require('console');
const quizz = require('../models/quizz');
// const { finished } = require('stream/promises');

const getAllCourses = async (req, res) => {
  try {
    const { language } = req.query;
    let months = 'months';
    let days = 'days';

    if (!['en', 'ru', 'am'].includes(language)) {
      return res.status(403).json({ message: 'The language must be am, ru, or en.' });
    }

    switch (language) {
      case 'am':
        months = 'ամիս';
        days = 'օր';
        break;
      case 'ru':
        months = 'месяц';
        days = 'день';
        break;
      default:
        months = 'months';
        days = 'days';
        break;
    }
    let Courses = await GroupCourses.findAll({
      include: [
        {
          model: CoursesContents,
          where: { language },
          attributes: { exclude: ['id', 'language', 'courseId'] },
        },
      ],
      order: [['bought', 'DESC']],
      attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
    });

    Courses = Courses.map((e) => {
      return {
        course: e,
        courseStartDate: moment(e.startDate).format('ll'),
        courseDate:
          moment().diff(e.startDate, 'months') > 0
            ? moment().diff(e.startDate, 'months') + ' ' + months
            : moment().diff(e.startDate, 'days') + ' ' + days,
      };
    });
    return res.status(200).json({ Courses });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getCourseTitles = async (req, res) => {
  try {
    const { language } = req.query;
    let months = 'months';
    let days = 'days';

    if (!['en', 'ru', 'am'].includes(language)) {
      return res.status(403).json({ message: 'The language must be am, ru, or en.' });
    }

    let Courses = await GroupCourses.findAll({
      include: [
        {
          model: CoursesContents,
          where: { language },
          attributes: ['title', 'description'],
        },
      ],
      order: [['id', 'DESC']],
      attributes: ['id'],
    });
    Courses = Courses.map((item) => {
      return {
        id: item.id,
        title: item?.CoursesContents[0].title,
        description: item?.CoursesContents[0].description.match(/\b(\w+\b\s*){1,16}/)[0],
      };
    });
    return res.status(200).json(Courses);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;

    const isCourse = await CoursesContents.findOne({
      where: { courseId: id },
    });
    console.log(isCourse, '++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    // if(!isCourse) return res.status(403).json({message:"Course not found"})
    if (isCourse && isCourse.courseType === 'Individual') {
      let course = await GroupCourses.findOne({
        where: { id },
        include: [
          {
            model: CoursesContents,
            where: { language, courseType: 'Individual' },
            attributes: [
              'id',
              'courseId',
              'language',
              'title',
              'description',
              'courseType',
              'shortDescription',
              'lessonType',
              'whyThisCourse',
              'level',
            ],
            required: true,
          },
          {
            model: levelDescription,
            attributes: ['title', 'description'],
          },
          {
            model: Lesson,
            attributes: [
              ['title_en', 'title'],
              ['description_en', 'description'],
            ],
            through: {
              attributes: [],
            },
          },
        ],
      });

      if (!course) {
        return res.status(403).json({ message: 'Course not found.' });
        // return res.json(groups)
      }

      const lessonsCount = await CoursesPerLessons.count({
        where: { courseId: id },
      });
      // const payment = await PaymentWays.findAll({
      // where: { groupId: groups.id },
      // attributes: ['id', 'title', 'description', 'price', 'discount'],
      // });

      const duration = moment(new Date()).diff(moment(new Date()), 'days');

      const trainers = await Trainer.findAll({
        where: { courseId: id },
        attributes: ['fullName', 'img', 'profession'],
      });

      course = {
        ...course.dataValues,
        startDate: new Date(),
        duration,
        lessonsCount,
        trainers: trainers,
        payment: [
          {
            id: 3,
            title: 'drfdsg',
            description: 'gfds',
            price: 100,
            discount: 0,
          },
        ],
      };
      return res.json(course);
    }

    const groups = await Groups.findOne({ where: { id } });

    if (!groups) return res.status(403).json({ message: 'Group not found' });
    let course = await GroupCourses.findOne({
      where: { id: groups.assignCourseId },
      include: [
        {
          model: CoursesContents,
          where: { language },
          attributes: [
            'id',
            'courseId',
            'language',
            'title',
            'description',
            'courseType',
            'shortDescription',
            'lessonType',
            'whyThisCourse',
            'level',
          ],
        },
        {
          model: levelDescription,
          attributes: ['title', 'description'],
        },
        {
          model: Lesson,
          attributes: [
            ['title_en', 'title'],
            ['description_en', 'description'],
          ],
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!course) {
      return res.status(500).json({ message: 'Course not found.' });
      // return res.json(groups)
    }

    const lessonsCount = await CoursesPerLessons.count({
      where: { courseId: id },
    });
    const payment = await PaymentWays.findAll({
      where: { groupId: groups.id },
      attributes: ['id', 'title', 'description', 'price', 'discount'],
    });

    const duration = moment(groups.endDate).diff(moment(groups.startDate), 'days');

    const trainers = await Trainer.findAll({
      where: { courseId: groups.assignCourseId },
      attributes: ['fullName', 'img', 'profession'],
    });

    course = {
      ...course.dataValues,
      startDate: groups.startDate,
      duration,
      lessonsCount,
      trainers: trainers,
      payment,
    };
    return res.send(course);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};
const like = async (req, res) => {
  try {
    let { courseId } = req.params;
    const { user_id: id } = req.user;

    courseId = +courseId;

    const user = await Users.findOne({ where: { id } });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
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
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

//   try {

//     const { groupId } = req.params;
//     const { user_id: userId } = req.user;

//     const user = await Users.findOne({ where: { id: userId } });
//     const group = await Groups.findByPk(groupId);
//     console.log(group);
//     if (!group) {
//       return res.json({ success: false, message: 'Group not found' });
//     }

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     await GroupsPerUsers.create({
//       groupId: groupId,
//       userId,
//     });
//     await UserCourses.create({
//       GroupCourseId: group.assignCourseId,

//       UserId: userId,
//     });
//     const lessons = await CoursesPerLessons.findAll({
//       where: { courseId: group.assignCourseId },
//     });

//     lessons.map((e) => {
//       UserLesson.create({
//         GroupCourseId: group.assignCourseId,
//         UserId: userId,
//         LessonId: e.lessonId,
//       });
//     });
//     const boughtTests = await Tests.findAll({
//       where: {
//         [sequelize.Op.or]: [{ courseId: group.assignCourseId }, { courseId: null }],
//         // language: 'ENG',
//       },
//     });
//     console.log(boughtTests);
//     boughtTests.map((test) => {
//       UserTests.findOrCreate({
//         where: {
//           testId: test.id,
//           userId,
//           courseId: test.courseId,
//           language: test.language,
//         },
//         defaults: {
//           testId: test.id,
//           userId,
//         },
//       });
//     });

//     res.send({ success: true });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: 'Something went wrong.' });
//   }
// };

const createTest = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { courseId } = req.body;

    const tests = await Tests.findAll({ where: { courseId } });
    const course = await tests.map((e) => {
      UserTests.findOrCreate({
        where: { userId, testId: e.id },
        defaults: {
          userId,
          testId: e.id,
          status: 'not passed',
          point: 0,
          type: 'Group',
        },
      });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getUserCourses = async (req, res) => {
  try {
    const { user_id: id } = req.user;
    const { language } = req.query;
    if (!id) {
      return res.status(500).json({ message: 'User not found' });
    }

    let courses = await UserCourses.findAll({
      where: { UserId: id },
      attributes: ['id', ['UserId', 'userId']],
      include: [
        {
          model: GroupCourses,
          include: [
            {
              model: CoursesContents,
              where: { language },
              attributes: ['title', 'description', 'level'],
            },
            {
              model: Groups,
              // where: { language },
              // attributes: ['title', 'description'],
            },
          ],
        },
      ],
    });

    courses = courses.map((e) => {
      e = e.toJSON();
      delete e.dataValues;
      const groupCourse = e.GroupCourse;
      const groups = groupCourse?.Groups || [];
      const coursesContents = groupCourse?.CoursesContents || [];
      const startDate = groups[0]?.startDate || null;
      const formattedDate = startDate
        ? new Date(startDate).toISOString().split('T')[0].slice(5).replace('-', '.')
        : null;
      const year = startDate ? new Date(startDate).getFullYear() : null;

      e['id'] = groups[0]?.id || null;
      e['groupCourseId'] = groups[0]?.assignCourseId || null;
      e['startDate'] = formattedDate.replace('/', '.');
      e['title'] = coursesContents[0]?.title || null;
      e['description'] = coursesContents[0]?.description || null;
      e['percent'] = 0;

      delete e.GroupCourse;
      return e;
    });
    return res.send({ courses });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getUserCourse = async (req, res) => {
  try {
    const { user_id: id } = req.user;
    const { courseId } = req.params;
    const { language } = req.query;
    if (!id) {
      return res.status(500).json({ message: 'User not found' });
    }
    let lessons = await CoursesPerLessons.findAll({
      where: { courseId },
      include: [
        {
          model: Lesson,
          attributes: [
            [`title_${language}`, 'title'],
            [`description_${language}`, 'description'],
          ],
        },
      ],
    });
    let finalInterview = await Calendar.findOne({
      where: {
        groupId: courseId,
        userId: {
          [Op.contains]: [id],
        },
      },
      attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
    });

    let { Quizzs } = await GroupCourses.findOne({
      where: { id: courseId },
      include: [
        {
          model: Quizz,
          attributes: ['id', ['title_en', 'title'], ['description_en', 'description']],
          through: { attributes: [] },
        },
      ],
    });

    lessons = lessons.map((e, i) => {
      e = e.toJSON();
      delete e.dataValues;
      e['title'] = e.Lesson.title;
      e['description'] = e.Lesson.description;
      e['number'] = i + 1;
      e['isOpen'] = true;
      delete e.Lessons;
      return e;
    });

    return res.json({ lessons, quizz: Quizzs[0], finalInterview });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
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
      shortDescription,
      lessons,
      trainers,
      type,
      quizzId,
    } = req.body;

    let { img, trainersImages } = req.files;

    const imgType = img.mimetype.split('/')[1];
    const imgFileName = v4() + '.' + imgType;
    img.mv(path.resolve(__dirname, '..', 'static', imgFileName));

    // let courseId;
    let { id: courseId } = await GroupCourses.create({ img: imgFileName });
    //  = Course.id
    // }
    trainers = JSON.parse(trainers);
    levelDescriptions = JSON.parse(levelDescriptions);
    whyThisCourse = JSON.parse(whyThisCourse);

    if (!Array.isArray(lessons)) lessons = [lessons];
    if (!Array.isArray(trainersImages)) trainersImages = [trainersImages];

    await CoursesContents.create({
      courseId,
      language,
      title,
      description,
      shortDescription,
      courseType,
      lessonType,
      whyThisCourse,
      level,
      type,
    });

    await CoursesPerQuizz.create({
      quizzId,
      courseId,
      type: courseType,
    });
    lessons = Array.isArray(lessons) ? lessons : [lessons];
    trainers = Array.isArray(trainers) ? trainers : [trainers];

    lessons.map((e) => {
      CoursesPerLessons.create({
        courseId,
        lessonId: e,
        type,
      });
    });
    trainers.map((e, i) => {
      const type = trainersImages[i].mimetype.split('/')[1];
      const fileName = v4() + '.' + type;
      trainersImages[i].mv(path.resolve(__dirname, '..', 'static', fileName));

      Trainer.create({
        fullName: e.fullName,
        img: fileName,
        profession: e.profession,
        courseId,
        type,
      });
    });

    levelDescriptions.map((e) => {
      levelDescription.create({
        title: e.title,
        description: e.description,
        courseId,
        type,
      });
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
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
      language = 'en',
      limit = null,
      order = 'popularity',
      courseType,
    } = req.query;

    format = format.split('_');
    level = level.split('_');
    if (!['en', 'ru', 'am'].includes(language)) {
      return res.status(403).json({ message: 'The language must be am, ru, or en.' });
    }
    if (!['popularity', 'newest', 'lowToHigh', 'highToLow'].includes(order)) {
      return res.status(403).json({
        message: 'The Order must be popularity or newest lowToHigh or highToLow.',
      });
    }
    if (!(level && format && language))
      return res.status(403).json({
        message: 'level, format, isDiscount and language is requred values',
      });

    let type = { [Op.gte]: 0 };
    if (isDiscount === 'true') {
      type = { [Op.gt]: 0 };
    }

    const months = { am: 'ամիս', ru: 'месяц', en: 'months' };
    const days = { am: 'օր', ru: 'день', en: 'days' };
    const orderTypes = {
      popularity: ['bought', 'DESC'],
      newest: ['createdAt', 'DESC'],
    };

    const levels = {};
    const getLevels = await Levels.findAll({
      attributes: [language, 'slug'],
    });
    getLevels.map((e) => {
      levels[e.slug] = e[language];
    });

    const formats = {};
    const getFormats = await Format.findAll({
      attributes: [language, 'slug'],
    });
    getFormats.map((e) => {
      formats[e.slug] = e[language];
    });

    const groups = {};
    const getGroups = await CourseType.findAll({
      attributes: [language, 'slug'],
    });
    getGroups.map((e) => {
      groups[e.slug] = e[language];
    });

    let Courses = await Groups.findAll({
      where: {
        sale: type,
        finished: false,
      },
      include: [
        {
          model: GroupsPerUsers,
          where: { userRole: 'STUDENT' },
          required: false,
        },
        {
          model: GroupCourses,
          required: true,
          include: [
            {
              model: CoursesContents,
              required: true,

              where: {
                language,
                level: {
                  [Op.in]: level,
                },
                lessonType: {
                  [Op.in]: format,
                },
              },
              attributes: { exclude: ['id', 'language', 'courseId'] },
              include: [Levels],
            },
          ],
        },
      ],
      // order: orderTypes[order] ? [orderTypes[order]] : [["id", "ASC"]],
      limit,
      attributes: ['id', ['name', 'title'], 'startDate', 'endDate', 'price', 'sale'],
      require: true,
    });

    let Individual = await CoursesContents.findAll({
      where: {
        courseType: 'Individual',
        courseId: {
          [Op.not]: null,
        },
        language,
        level: {
          [Op.in]: level,
        },
        lessonType: {
          [Op.in]: format,
        },
      },
    });

    // return res.json({Individual})
    const criticalPrices = await Groups.findOne({
      attributes: [
        [sequelize.fn('min', sequelize.col('price')), 'minPrice'],
        [sequelize.fn('max', sequelize.col('price')), 'maxPrice'],
      ],
    });
    Courses = Courses.map((e) => {
      e = e.toJSON();
      delete e.dataValues;

      e.img = `https://platform.tesvan.com/server/${e.GroupCourse.img}`;
      e.description = e.GroupCourse.CoursesContents[0].description;
      e.courseType = e.GroupCourse.CoursesContents[0].courseType;
      e.lessonType = e.GroupCourse.CoursesContents[0].lessonType;
      e.level = e.GroupCourse.CoursesContents[0].level;
      e.courseStartDate = moment(e.startDate).format('ll');
      (e.courseDate =
        moment(new Date(e.endDate)).diff(new Date(e.startDate), 'months') > 0
          ? moment(e.endDate).diff(new Date(e.startDate), 'months') + ' ' + months[language]
          : moment(e.endDate).diff(new Date(e.startDate), 'days') + ' ' + days[language]),
        (e.price = e.price);
      (e.saledValue = e.price > 0 ? e.price - Math.round(e.price * e.sale) / 100 : e.price),
        (e.bought = e.GroupsPerUsers.length);
      delete e.GroupCourse;
      return e;
    });

    if (order === 'highToLow') Courses = Courses.sort((a, b) => b.saledValue - a.saledValue);
    if (order === 'popularity') Courses = Courses.sort((a, b) => b.bought - a.bought);
    if (order === 'newest') Courses = Courses.sort((a, b) => b.courseStartDate - a.courseStartDate);
    if (order === 'lowToHigh') Courses = Courses.sort((a, b) => a.saledValue - b.saledValue);
    Courses = Courses.filter((e) => e.saledValue >= minPrice && e.saledValue <= maxPrice);

    // if (courseType === 'Individual') {
    //   return res.status(200).send(IndividualCourses);
    // }
    // if (courseType === 'Group') {
    //   return res.status(200).send(GroupCourses);
    // }
    // let course = {
    //   ...IndividualCourses,
    //   ...GroupCourses,
    // };
    // <<<<<<< Updated upstream

    //     return res.status(200).json({ Courses, criticalPrices });
    // =======
    //     // return res.json({Individual})
    Individual = Individual.map((e) => {
      e = e.toJSON();
      delete e.dataValues;
      return {
        id: e.courseId,
        title: e.title,
        // startDate: "2024-04-15T20:00:00.000Z",
        // endDate: "2024-04-29T20:00:00.000Z",
        price: 80,
        sale: 1,
        // courseStartDate: "Apr 16, 2024",
        courseDate: '1 month',
        saledValue: 79.2,
        bought: 0,
        img: `https://platform.tesvan.com/server/${e.img}`,
        description: e.description,
        courseType: e.courseType,
        lessonType: e.lessonType,
        level: e.level,
      };
    });

    if (courseType == 'Group') {
      return res.status(200).json({ Courses, criticalPrices });
    } else if (courseType == 'Individual') {
      console.log('++++');
      return res.status(200).json({ Courses: Individual, criticalPrices });
    } else {
      Courses = [...Courses, ...Individual];
      return res.status(200).json({ Courses, criticalPrices });
    }
    // >>>>>>> Stashed changes
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getOneGroup = async (req, res) => {
  try {
    let { id, priceId, language } = req.query;

    const isCourse = await CoursesContents.findOne({
      where: { courseId: id },
    });
    // if(!isCourse) return res.status(403).json({message:"Course not found"})
    if (isCourse && isCourse.courseType === 'Individual') {
      let course = await GroupCourses.findOne({
        where: { id },
        include: [
          {
            model: CoursesContents,
            where: { language, courseType: 'Individual' },
            attributes: [
              'id',
              'courseId',
              'language',
              'title',
              'description',
              'courseType',
              'shortDescription',
              'lessonType',
              'whyThisCourse',
              'level',
            ],
            required: true,
          },
        ],
      });

      if (!course) {
        return res.status(403).json({ message: 'Course not found.' });
        // return res.json(groups)
      }

      course = {
        title: course.CoursesContents[0].title,
        courseType: course.CoursesContents[0].courseType,
        lessonType: course.CoursesContents[0].lessonType,
        level: course.CoursesContents[0].level,
        // courseStartDate: moment().format('ll'),
        // courseDate:
        //   moment().diff(new Date().toISOString(), "months") > 0
        //     ? moment().diff(new Date().toISOString(), "months") +
        //       " " +
        //       months[language]
        //     : moment().diff(new Date().toISOString(), "days") +
        //       " " +
        //       days[language],
        price: 1,
        sale: 0,
        // saledValue: course.price > 0 ? course.price - Math.round(course.price * course.discount) / 100 : course.price,
        saledValue: 1,
      };
      return res.json(course);
    }

    let Courses = await Groups.findByPk(id, {
      include: [
        {
          model: GroupCourses,
          require: true,
          include: [
            {
              model: CoursesContents,
              attributes: { exclude: ['id', 'language', 'courseId'] },
              include: [Levels],
            },
          ],
        },
      ],
    });

    const { price, discount } = await PaymentWays.findByPk(priceId);

    Courses = Courses.toJSON();
    delete Courses.dataValues;
    // return res.json({Courses})
    Courses = {
      title: Courses.name,
      courseType: Courses.GroupCourse.CoursesContents[0].courseType,
      lessonType: Courses.GroupCourse.CoursesContents[0].lessonType,
      level: Courses.GroupCourse.CoursesContents[0].level,
      courseStartDate: moment().format('ll'),
      // courseDate:
      //   moment().diff(new Date().toISOString(), "months") > 0
      //     ? moment().diff(new Date().toISOString(), "months") +
      //       " " +
      //       months[language]
      //     : moment().diff(new Date().toISOString(), "days") +
      //       " " +
      //       days[language],
      price,
      sale: discount,
      saledValue: price > 0 ? price - Math.round(price * discount) / 100 : price,
    };
    return res.status(200).json(Courses);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

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
      image,
      trainers,
      trainersImages,
      quizzId,
      type,
    } = req.body;

    trainers = JSON.parse(trainers);
    if (!Array.isArray(lessons)) lessons = [lessons];
    if (!Array.isArray(trainersImages)) trainersImages = [trainersImages];

    await GroupCourses.update({ img: image[0].url }, { where: { id: courseId } });
    await CoursesContents.update(
      {
        language,
        title,
        description,
        courseType,
        lessonType,
        whyThisCourse,
        level,
      },
      { where: { courseId, language } },
    );

    await CoursesPerQuizz.destroy({
      where: {
        id: quizzId,
      },
    });
    await CoursesPerQuizz.create({
      courseId,
      quizzId,
    });

    if (Array.isArray(levelDescriptions) && levelDescriptions.length > 0) {
      await levelDescription.destroy({ where: { courseId } });
      levelDescriptions.map((e) => {
        levelDescription.create({
          title: e.title,
          description: e.description,
          courseId,
          type,
        });
      });
    }

    await CoursesPerLessons.destroy({ where: { courseId } });
    lessons.forEach(async (e) => {
      await CoursesPerLessons.create({
        courseId,
        lessonId: e,
        type: 'Group',
      });
    });

    await Trainer.destroy({ where: { courseId } });
    trainers.forEach(async (e, i) => {
      await Trainer.create({
        fullName: e.fullName,
        img: trainersImages[i],
        profession: e.profession,
        courseId,
        type: 'Group',
      });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    GroupCourses.destroy({ where: { id } });
    CoursesContents.destroy({
      where: { courseId: id },
    });

    CoursesPerLessons.destroy({
      where: { courseId: id },
    });

    Trainer.destroy({
      where: { courseId: id },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getCourseForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    let course = await GroupCourses.findOne({
      where: { id },
      include: [
        {
          model: CoursesContents,
          attributes: { exclude: ['id', 'courseId', 'language'] },
          where: { language: 'en' },
        },
        {
          model: levelDescription,
          attributes: ['title', 'description'],
        },
        {
          model: Lesson,
          attributes: ['id', ['title_en', 'title'], ['description_en', 'description']],
        },
        {
          model: Quizz,
          attributes: ['id', ['title_en', 'title'], ['description_en', 'description']],
          through: { attributes: [] },
        },
      ],
      attributes: ['id', 'img'],
    });

    if (!course) return res.json({ success: false, message: 'Course not found' });

    const trainers = await Trainer.findAll({
      where: { courseId: id },
      attributes: ['fullName', 'img', 'profession'],
    });

    course.Lesson = course.Lessons.map((e) => {
      delete e.dataValues.CoursesPerLessons;
      return e;
    });

    course = {
      id: course.id,
      img: course.img,
      title: course.CoursesContents[0].title,
      description: course.CoursesContents[0].description,
      courseType: course.CoursesContents[0].courseType,
      lessonType: course.CoursesContents[0].lessonType,
      whyThisCourse: course.CoursesContents[0].whyThisCourse,
      level: course.CoursesContents[0].level,
      level: course.CoursesContents[0].level,
      levelDescriptions: course.levelDescriptions,
      lessons: course.Lessons.map((lesson, index) => {
        const formattedLesson = {
          id: lesson.dataValues.id,
          title: lesson.dataValues.title,
          description: lesson.dataValues.description
            ? lesson.dataValues.description.match(/\b(\w+\b\s*){1,16}/)[0]
            : lesson.dataValues.description,
          number: index + 1,
          isOpen: true,
        };
        return formattedLesson;
      }),
      quizz: course.Quizzs[0],
      trainers,
    };
    delete course.CoursesContents;
    return res.json(course);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const IndividualGetOne = async (req, res) => {
  try {
    const { id } = req.params;

    const { language } = req.query;

    let course = await GroupCourses.findOne({
      where: { id },
      include: [
        {
          model: CoursesContents,
          where: { language, courseType: 'Individual' },
          attributes: [
            'id',
            'courseId',
            'language',
            'title',
            'description',
            'courseType',
            'shortDescription',
            'lessonType',
            'whyThisCourse',
            'level',
          ],
          required: true,
        },
        {
          model: levelDescription,
          attributes: ['title', 'description'],
        },
        {
          model: Lesson,
          attributes: [
            ['title_en', 'title'],
            ['description_en', 'description'],
          ],
          through: {
            attributes: [],
          },
        },
      ],
    });
    if (!course) {
      return res.status(403).json({ message: 'Course not found.' });
      // return res.json(groups)
    }

    const lessonsCount = await CoursesPerLessons.count({
      where: { courseId: id },
    });
    // const payment = await PaymentWays.findAll({
    // where: { groupId: groups.id },
    // attributes: ['id', 'title', 'description', 'price', 'discount'],
    // });

    const duration = moment(new Date()).diff(moment(new Date()), 'days');

    const trainers = await Trainer.findAll({
      where: { courseId: id },
      attributes: ['fullName', 'img', 'profession'],
    });

    course = {
      ...course.dataValues,
      startDate: new Date(),
      duration,
      lessonsCount,
      trainers: trainers,
      payment: [
        {
          id: 3,
          title: 'drfdsg',
          description: 'gfds',
          price: 100,
          discount: 0,
        },
      ],
    };
    res.send(course);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = {
  getAllCourses,
  getCoursesByFilter,
  getOne,
  like,
  // buy,
  IndividualGetOne,
  getUserCourses,
  getUserCourse,
  getCourseTitles,
  createTest,
  createCourse,
  updateCourse,
  getOneGroup,
  deleteCourse,
  getCourseForAdmin,
};
