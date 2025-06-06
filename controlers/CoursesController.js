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
  UserPoints,
  Calendar,
  UserInterview,
  HomeworkPerLesson,
  UserHomework,
  Question,
  continuingGroups,
  Payment,
  IndividualGroupParams
} = require('../models');

const { CoursesContents } = require('../models');
const { UserCourses } = require('../models');
const { Levels } = require('../models');
const { CourseType } = require('../models');
const { Format } = require('../models');
const { Users } = require('../models');
const { Trainer } = require('../models');
const { UserLesson } = require('../models');
const { Lesson } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const { v4 } = require('uuid');
const moment = require('moment');
const path = require('path');
const { courseBlock } = require('../service/CourseBlock')
const { courseSlice } = require('../service/CourseSlice')

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
  const { user_id: userId } = req.user;
  try {
    const { language } = req.query;
    let months = 'months';
    let days = 'days';
    const { creatorId } = await Users.findByPk(userId)

    const teacher = await Users.findAll({
      where: {
        role: "TEACHER",
        creatorId: +userId
      },
      attributes: ["id", "firstName", "lastName", "image", "role"]
    });

    const teacherIds = teacher.reduce((aggr, value) => {
      aggr.push(value.id)
      return aggr;
    }, []);

    if (!['en', 'ru', 'am'].includes(language)) {
      return res.status(403).json({ message: 'The language must be am, ru, or en.' });
    }

    let Courses = await GroupCourses.findAll({
      where: {
        creatorId: [userId, creatorId, ...teacherIds]
      },
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
        description: item?.CoursesContents[0].description,
      };
    });

    const courseIds = Courses.reduce((aggr, value) => {
      aggr.push(value.id)
      return aggr;
    }, []);

    const groups = await Groups.findAll({
      where: {
        assignCourseId: courseIds
      },
      attributes: ["finished", "assignCourseId"]
    });

    const groupFinihed = groups.reduce((aggr, value) => {
      aggr[value.assignCourseId] = value.finished
      return aggr
    }, {})

    Courses = Courses.reduce((aggr, value) => {
      if (groupFinihed[value.id] === true) {
        value.type = "finished"
      } else if (groupFinihed[value.id] === false) {
        value.type = "inProgrss"
      } else {
        value.type = null
      };
      aggr.push(value);
      return aggr
    }, []);

    return res.status(200).json(Courses);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getCourseTitleForTeacher = async (req, res) => {
  try {

    const { user_id: userId } = req.user;

    const { language } = req.query;
    let courses = await UserCourses.findAll({
      where: { UserId: userId },
      attributes: ['id', ['UserId', 'userId']],
      include: [
        {
          model: GroupCourses,
          include: [
            {
              model: CoursesContents,
              where: { language },
              attributes: ["courseId", "title", "description"]
            },
          ],
        },
      ],

    });

    courses = courses.reduce((aggr, value) => {

      const content = {
        id: value.GroupCourse.CoursesContents[0].courseId,
        title: value.GroupCourse.CoursesContents[0].title,
        description: value.GroupCourse.CoursesContents[0].description,
      };
      aggr.push(content)
      return aggr
    }, [])

    const teacherCourses = await CoursesContents.findAll({
      where: {
        creatorId: userId,
        language
      },
      attributes: [["courseId", "id"], "title", "description"]
    });

    courses = [...teacherCourses, ...courses]
    courses = Array.from(
      new Map(courses.map(e => [e.id, e])).values()
    );

    const courseIds = courses.reduce((aggr, value) => {
      aggr.push(value.id)
      return aggr;
    }, []);

    const groups = await Groups.findAll({
      where: {
        assignCourseId: courseIds
      },
      attributes: ["finished", "assignCourseId"]
    });

    const groupFinihed = groups.reduce((aggr, value) => {
      aggr[value.assignCourseId] = value.finished
      return aggr
    }, {})

    courses = courses.reduce((aggr, value) => {
      if (groupFinihed[value.id] === true) {
        value.type = "finished"
      } else if (groupFinihed[value.id] === false) {
        value.type = "inProgress"
      } else {
        value.type = null
      };
      aggr.push(value);
      return aggr
    }, [])

    return res.status(200).json(courses);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
}

const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;

    // const isCourse = await CoursesContents.findOne({
    //   where: { courseId: id, language },
    // });

    // if(!isCourse) return res.status(403).json({message:"Course not found"})
    // if (isCourse && isCourse.courseType === 'Individual') {
    //   let course = await GroupCourses.findOne({
    //     where: { id },
    //     include: [
    //       {
    //         model: CoursesContents,
    //         where: { language, courseType: 'Individual' },
    //         attributes: [
    //           'id',
    //           'courseId',
    //           'language',
    //           'title',
    //           'description',
    //           'courseType',
    //           'shortDescription',
    //           'lessonType',
    //           'whyThisCourse',
    //           'level',
    //         ],
    //         required: true,
    //       },
    //       {
    //         model: levelDescription,
    //         attributes: [
    //           [`title_${language}`, 'title'],
    //           [`description_${language}`, 'description'],
    //         ],
    //       },
    //       {
    //         model: Lesson,
    //         attributes: [
    //           [`title_${language}`, 'title'],
    //           ['description_en', 'description'],
    //         ],
    //         through: {
    //           attributes: [],
    //         },
    //       },
    //     ],
    //   });

    //   if (!course) {
    //     return res.status(403).json({ message: 'Course not found.' });
    //     // return res.json(groups)
    //   }

    //   const lessonsCount = await CoursesPerLessons.count({
    //     where: { courseId: id },
    //   });
    //   // const payment = await PaymentWays.findAll({
    //   // where: { groupId: groups.id },
    //   // attributes: ['id', 'title', 'description', 'price', 'discount'],
    //   // });

    //   const duration = moment(new Date()).diff(moment(new Date()), 'days');

    //   const trainers = await Trainer.findAll({
    //     where: { courseId: id },
    //     attributes: [
    //       [`fullName_${language}`, 'fullName'],
    //       'img',
    //       [`profession_${language}`, 'profession'],
    //     ],
    //   });

    //   course = {
    //     ...course.dataValues,
    //     startDate: new Date(),
    //     duration,
    //     lessonsCount,
    //     trainers: trainers,
    //     payment: [
    //       {
    //         id: 3,
    //         title: 'drfdsg',
    //         description: 'gfds',
    //         price: 100,
    //         discount: 0,
    //       },
    //     ],
    //   };
    //   return res.json(course);
    // }

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
          attributes: [
            [`title_${language}`, 'title'],
            [`description_${language}`, 'description'],
          ],
        },
        {
          model: Lesson,
          attributes: [
            'id',
            [`title_${language}`, 'title'],
            [`description_${language}`, 'description'],
          ],
          through: {
            attributes: ['id'],
          },
        },
      ],
    });

    if (!course) {
      return res.status(500).json({ message: 'Course not found.' });
      // return res.json(groups)
    }
    course.Lessons = course.Lessons.sort((a, b) => a.CoursesPerLessons.id - b.CoursesPerLessons.id);
    const lessonsCount = await CoursesPerLessons.count({
      where: { courseId: id },
    });
    const payment = await PaymentWays.findAll({
      where: { groupId: groups.id },
      attributes: [
        'id',
        [`title_${language}`, 'title'],
        [`description_${language}`, 'description'],
        'price',
        'discount',
      ],
      order: [["id", "ASC"]]
    });

    const duration = moment(groups.endDate).diff(moment(groups.startDate), 'days');

    const trainers = await Trainer.findAll({
      where: { courseId: groups.assignCourseId },
      attributes: [
        [`fullName_${language}`, 'fullName'],
        'img',
        [`profession_${language}`, 'profession'],
      ],
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

    //919 907

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
              attributes: ['title', 'description', 'level', 'courseType'],
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
    courses = await Promise.all(
      courses = courses.map(async (e) => {
        e = e.toJSON();
        delete e.dataValues;
        // if (e.GroupCourse?.CoursesContents[0].courseType === 'Individual') {
        //   const IndividualCourse = {
        //     id: e.GroupCourse.id,
        //     userId: e.userId,
        //     groupCourseId: e.GroupCourse.id,
        //     startDate: null,
        //     title: e.GroupCourse.CoursesContents[0].title,
        //     description: e.GroupCourse.CoursesContents[0].description,
        //     percent: 0,
        //   };
        //   return IndividualCourse;
        // }
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
        e['startDate'] = formattedDate && `${formattedDate.replace('/', '.')}.${year}`;
        e['title'] = coursesContents[0]?.title || null;
        e['description'] = coursesContents[0]?.description || null;
        e['percent'] = 0;

        try {
          e['blocked'] = await courseBlock(groups[0]?.id, id);
        } catch (error) {
          e['blocked'] = false;
        }

        delete e.GroupCourse;
        return e;
      })
    )

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
      return res.status(404).json({ message: 'User not found' });
    }

    const groups = await Groups.findOne({
      where: {
        assignCourseId: courseId,
      },
    });

    //--- if need block ---
    // const block = await courseBlock(groups.id, id);
    // if (block) {
    //   return res.status(401).json({ message: "Your course is inactive due to payment." });
    // };

    const courseSliceDate = await courseSlice(groups.id, id)

    let lessons = await CoursesPerLessons.findAll({
      where: {
        courseId,
        ...(courseSliceDate && {
          createdAt: {
            [Op.lt]: courseSliceDate,
          },
        }),
      },
      order: [['number', 'ASC']],
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

    let { Quizzs } = await GroupCourses.findOne({
      where: { id: courseId },
      include: [
        {
          model: Quizz,
          attributes: ['id', [`title_${language}`, 'title'], ['description_en', 'description']],
          through: { attributes: [] },
          include: [
            {
              model: Question,
              attributes: ['id', 'quizzId', 'title_ru', 'title_en', 'title_am', 'points'],
            },
          ],
        },
      ],
    });

    const maxFinalQuizPoint = Quizzs[0].Questions[0].points * Quizzs[0].Questions.length

    const isOpenQuiz = await CoursesPerQuizz.findOne({
      where: {
        courseId,
        quizzId: Quizzs[0].id
      }
    })
    const userPoint = await UserPoints.findOne({
      where: { userId: id, isFinal: true, courseId },
    });
    let quizz = {
      id: Quizzs[0].id,
      title: Quizzs[0].dataValues.title,
      description: Quizzs[0].dataValues.description,
      points: userPoint ? userPoint.point : null,
      isOpen: isOpenQuiz ? isOpenQuiz.isOpen : false,
      maxFinalQuizPoint
    };


    let finalInterview = await Calendar.findOne({
      where: {
        groupId: groups.id,
        userId: {
          [Op.contains]: [id],
        },
      },
      include: [
        {
          model: UserInterview,
          attributes: ['points', 'calendarId'],
          where: { userId: id },
        },
      ],
      attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
    });

    lessons = lessons.map((e, i) => {
      // console.log();
      e = e.toJSON();
      delete e.dataValues;
      e['title'] = e.Lesson?.title;
      e['description'] = e.Lesson?.description;
      e['number'] = e.number;
      e['isOpen'] = true;
      delete e.Lessons;
      return e;
    });

    if (groups.type === "individual") {
      const openLessonCount = await IndividualGroupParams.findOne({
        where: {
          userId: id,
          groupId: groups.id,
          courseId: groups.assignCourseId
        }
      })
      const newLesson = lessons.slice(0, openLessonCount.lessonCount);
      return res.json({ lessons: newLesson, quizz, finalInterview });
    }

    return res.json({ lessons, quizz, finalInterview });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    let {
      title_en,
      title_am,
      title_ru,
      description_en,
      description_am,
      description_ru,
      courseType_ru,
      courseType_am,
      courseType_en,
      lessonType_en,
      lessonType_am,
      lessonType_ru,
      whyThisCourse_en,
      whyThisCourse_am,
      whyThisCourse_ru,
      level_ru,
      level_am,
      level_en,
      levelDescriptions_en,
      levelDescriptions_ru,
      levelDescriptions_am,
      shortDescription_en,
      shortDescription_ru,
      shortDescription_am,
      lessons,
      trainers,
      type,
      quizzId,
      duration,
      price,
      discount,
      priceDescription_am,
      priceDescription_en,
      priceDescription_ru,
      priceTitle_am,
      priceTitle_en,
      priceTitle_ru,
      maxQuizzPoint,
      maxHomeworkPoint,
      maxInterviewPoint
    } = req.body;

    let { img, trainersImages } = req.files;

    const imgType = img.mimetype.split('/')[1];
    const imgFileName = v4() + '.' + imgType;
    img.mv(path.resolve(__dirname, '..', 'static', imgFileName));

    let { id: courseId } = await GroupCourses.create({ img: imgFileName, creatorId: userId });

    if (!Array.isArray(lessons)) lessons = [lessons];
    if (!Array.isArray(trainersImages)) trainersImages = [trainersImages];

    const languages = ['en', 'am', 'ru'];
    await Promise.all(
      languages.map(async (language) => {
        await CoursesContents.create({
          courseId,
          language,
          title: req.body[`title_${language}`],
          description: req.body[`description_${language}`],
          shortDescription: req.body[`shortDescription_${language}`],
          courseType: req.body[`courseType_${language}`],
          lessonType: req.body[`lessonType_${language}`],
          whyThisCourse: JSON.parse(req.body[`whyThisCourse_${language}`]),
          level: req.body[`level_${language}`],
          duration: 0,
          // priceTitle: req.body[`priceTitle_${language}`],
          // priceDescription: req.body[`priceDescription_${language}`],
          price: 0,
          discount: 0,
          maxQuizzPoint,
          maxHomeworkPoint,
          maxInterviewPoint,
          creatorId: userId
        });
      }),
    );
    if (quizzId !== 'undefined') {
      await CoursesPerQuizz.create({
        quizzId,
        courseId,
        type: courseType_en,
      });
    }

    lessons = Array.isArray(lessons) ? lessons : [lessons];
    trainers = Array.isArray(trainers) ? trainers : [trainers];

    lessons.map((e, i) => {
      CoursesPerLessons.create({
        courseId,
        lessonId: e,
        number: i + 1,
        type,
      });
    });
    trainers = JSON.parse(trainers);

    trainers.map(async (e, i) => {
      const type = trainersImages[i].mimetype.split('/')[1];
      const fileName = v4() + '.' + type;
      trainersImages[i].mv(path.resolve(__dirname, '..', 'static', fileName));

      await Trainer.create({
        fullName_en: e.fullName_en,
        fullName_ru: e.fullName_en,
        fullName_am: e.fullName_am,
        img: fileName,
        profession_en: e.profession_en,
        profession_ru: e.profession_ru,
        profession_am: e.profession_am,
        courseId,
        type,
      });
    });
    levelDescriptions_en = JSON.parse(levelDescriptions_en);
    levelDescriptions_ru = JSON.parse(levelDescriptions_ru);
    levelDescriptions_am = JSON.parse(levelDescriptions_am);

    levelDescriptions_en.map(async (e, i) => {
      await levelDescription.create({
        title_en: e.title,
        description_en: e.description,
        title_ru: levelDescriptions_ru[i].title,
        description_ru: levelDescriptions_ru[i].description,
        title_am: levelDescriptions_am[i].title,
        description_am: levelDescriptions_am[i].description,
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
      language,
      limit = null,
      order = 'popularity',
      courseType,
    } = req.query;

    courseType = courseType?.toLowerCase()

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
        ...(courseType && { type: courseType }),
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
      attributes: ['id', [`name_${language}`, 'title'], 'startDate', 'endDate', 'price', 'sale'],
      require: true,
    });

    const criticalPrices = await Groups.findOne({
      attributes: [
        [
          sequelize.literal('MIN(price * (1 - sale / 100))'),
          'minPrice',
        ],
        [
          sequelize.fn('MAX', sequelize.col('price')),
          'maxPrice',
        ],
      ],
    });

    function dateDifferenceInDays(date) {
      const moment = new Date()
      const diffInTime = date.getTime() - moment.getTime();
      const diffInDays = diffInTime / (1000 * 3600 * 24); // Convert milliseconds to days
      if (diffInDays >= 0) {
        return "active"
      } else {
        return "inProgress"
      }
    };

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
      e.saledValue = e.price * (1 - e.sale / 100),
        console.log(e.saledValue, 852);

      (e.bought = e.GroupsPerUsers.length);
      delete e.GroupCourse;
      e.status = dateDifferenceInDays(e.startDate)
      return e;
    })

    if (order === 'highToLow') Courses = Courses.sort((a, b) => b.saledValue - a.saledValue);
    if (order === 'popularity') Courses = Courses.sort((a, b) => b.bought - a.bought);
    if (order === 'newest') Courses = Courses.sort((a, b) => b.courseStartDate - a.courseStartDate);
    if (order === 'lowToHigh') Courses = Courses.sort((a, b) => a.saledValue - b.saledValue);
    Courses = Courses.filter((e) => e.saledValue >= minPrice && e.saledValue <= maxPrice);
    const resDate = Courses.sort((a, b) => b.id - a.id)
    return res.status(200).json({ Courses: resDate, criticalPrices });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getOneGroup = async (req, res) => {
  try {
    let { id, priceId, language } = req.query;

    // const isCourse = await CoursesContents.findOne({
    //   where: { courseId: id, language },
    // });
    // if(!isCourse) return res.status(403).json({message:"Course not found"})
    // if (isCourse && isCourse.courseType === 'Individual') {
    //   let course = await GroupCourses.findOne({
    //     where: { id },
    //     include: [
    //       {
    //         model: CoursesContents,
    //         where: { language, courseType: 'Individual' },
    //         attributes: [
    //           'id',
    //           'courseId',
    //           'language',
    //           'title',
    //           'description',
    //           'courseType',
    //           'shortDescription',
    //           'lessonType',
    //           'whyThisCourse',
    //           'level',
    //         ],
    //         required: true,
    //       },
    //     ],
    //   });

    //   if (!course) {
    //     return res.status(403).json({ message: 'Course not found.' });
    //     // return res.json(groups)
    //   }

    //   course = {
    //     title_en: course.CoursesContents[0].title,
    //     courseType_en: course.CoursesContents[0].courseType,
    //     lessonType_en: course.CoursesContents[0].lessonType,
    //     level_en: course.CoursesContents[0].level,
    //     // courseStartDate: moment().format('ll'),
    //     // courseDate:
    //     //   moment().diff(new Date().toISOString(), "months") > 0
    //     //     ? moment().diff(new Date().toISOString(), "months") +
    //     //       " " +
    //     //       months[language]
    //     //     : moment().diff(new Date().toISOString(), "days") +
    //     //       " " +
    //     //       days[language],
    //     price: 1,
    //     sale: 0,
    //     // saledValue: course.price > 0 ? course.price - Math.round(course.price * course.discount) / 100 : course.price,
    //     saledValue: 1,
    //   };
    //   return res.json(course);
    // }

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

    let { price, discount } = await PaymentWays.findByPk(priceId);

    Courses = Courses.toJSON();
    delete Courses.dataValues;
    // return res.json({Courses})

    const jwt = require("jsonwebtoken");
    const token = req.headers?.authorization?.split(" ")[1];
    let thisCoursePrice
    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET);
      const paymentWay = await PaymentWays.findByPk(priceId);
      const group = await Groups.findOne({
        where: {
          id: paymentWay?.groupId
        },
        include: [
          {
            model: continuingGroups,
            as: "lastGroup",
            require: false
          }
        ]
      });
      if (!group) {
        return res.status(400).json({ success: false, message: "This course not found" });
      };
      if (group.finished) {
        return res.status(400).json({ success: false, message: "This course finished" });
      };
      if (group.lastGroup) {
        const lastCoursePayment = await Payment.findAll({
          where: {
            userId: decoded.user_id,
            groupId: group.lastGroup.lastGroupId,
            status: "Success"
          }
        })

        const lastCourse = await PaymentWays.findOne({
          where: {
            groupId: group.lastGroup.lastGroupId,
            type: paymentWay.type,
          },
        });

        const lastGroup = await GroupsPerUsers.findOne({
          where: {
            groupId: group.lastGroup?.lastGroupId,
            userId: decoded.user_id,
            userRole: "STUDENT"
          }
        })

        if (lastGroup && group.lastGroup && paymentWay.type === "full" && lastCoursePayment.length > 0 && (lastCoursePayment[0].type === "full" || lastCoursePayment.length >= lastCourse.durationMonths)) {

          thisCoursePrice = (paymentWay.price * (1 - lastCourse.discount / 100)) * (paymentWay.durationMonths - 1) / paymentWay.durationMonths
        } else {
          thisCoursePrice = paymentWay.price * (1 - paymentWay.discount / 100);
        }
      } else {
        thisCoursePrice = paymentWay.price * (1 - paymentWay.discount / 100);
      }
    };

    thisCoursePrice = Math.ceil(+Math.round(thisCoursePrice));
    const saledValue = thisCoursePrice ? thisCoursePrice : price > 0 ? price - Math.round(price * discount) / 100 : price;


    Courses = {
      title: Courses[`name_${language}`],
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
      saledValue
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
    const { user_id: userId } = req.user;
    const {
      title_en,
      title_am,
      title_ru,
      description_en,
      description_am,
      description_ru,
      courseType_ru,
      courseType_am,
      courseType_en,
      lessonType_en,
      lessonType_am,
      lessonType_ru,
      whyThisCourse_en,
      whyThisCourse_am,
      whyThisCourse_ru,
      level_ru,
      level_am,
      level_en,
      levelDescriptions_en,
      levelDescriptions_ru,
      levelDescriptions_am,
      shortDescription_en,
      shortDescription_ru,
      shortDescription_am,
      lessons,
      trainersImages,
      trainers,
      type,
      quizzId,
      maxQuizzPoint,
      maxHomeworkPoint,
      maxInterviewPoint,
      image
    } = req.body;

    const updatedCourse = {
      title_en,
      title_am,
      title_ru,
      description_en,
      description_am,
      description_ru,
      courseType_ru,
      courseType_am,
      courseType_en,
      lessonType_en,
      lessonType_am,
      lessonType_ru,
      whyThisCourse_en,
      whyThisCourse_am,
      whyThisCourse_ru,
      level_ru,
      level_am,
      level_en,
      shortDescription_en,
      shortDescription_ru,
      shortDescription_am,
    };

    if (req.files && req.files.image) {
      const img = req.files.img;
      const imgType = img.mimetype.split('/')[1];
      const imgFileName = `${v4()}.${imgType}`;
      await img.mv(path.resolve(__dirname, '..', 'static', imgFileName));
      updatedCourse.img = imgFileName;

    }

    const course = await GroupCourses.findOne({
      where: { id: courseId, creatorId: userId }
    });

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "You do not have permission to update this course."
      });
    }

    // Update course in the database
    await GroupCourses.update(
      { img: image[0].url },
      { where: { id: courseId, creatorId: userId } }
    );

    // Update course contents in multiple languages
    const languages = ['en', 'am', 'ru'];
    await Promise.all(
      languages.map(async (language) => {
        await CoursesContents.update(
          {
            title: req.body[`title_${language}`],
            description: req.body[`description_${language}`],
            shortDescription: req.body[`shortDescription_${language}`],
            courseType: req.body[`courseType_${language}`],
            lessonType: req.body[`lessonType_${language}`],
            whyThisCourse: JSON.parse(req.body[`whyThisCourse_${language}`]),
            level: req.body[`level_${language}`],
            maxQuizzPoint,
            maxHomeworkPoint,
            maxInterviewPoint
          },
          { where: { courseId, language } },
        );
      }),
    );

    if (quizzId) {
      const [record, created] = await CoursesPerQuizz.findOrCreate({
        where: {
          courseId,
        },
        defaults: {
          courseId,
          type: "Group",
          quizzId,
        },
      });
      if (!created) {
        await CoursesPerQuizz.update({ quizzId }, { where: { courseId } });
      }
    }
    const usersHaveACourse = await UserCourses.findAll({ where: { GroupCourseId: courseId } });
    const userIds = [...new Set(usersHaveACourse.map((user) => user.UserId))];
    const lessonIds = Array.isArray(lessons) ? lessons : [lessons];
    await CoursesPerLessons.destroy({
      where: {
        courseId,
        lessonId: {
          [Op.notIn]: lessonIds ? lessonIds : null
        }
      }
    });

    const sequence = await CoursesPerLessons.findOne({ where: { courseId }, order: [['createdAt', 'DESC']] });
    let lessonNumber = +sequence?.number
    await Promise.all(
      lessonIds.flatMap(async (lessonId, i) => {
        const homework = await HomeworkPerLesson.findOne({ where: { lessonId: lessonId } })
        const coursePerLesson = await CoursesPerLessons.findOne({
          where: {
            courseId, lessonId
          },
        })

        if (!coursePerLesson) {
          lessonNumber = lessonNumber + 1
          await CoursesPerLessons.create({
            courseId, lessonId, type, number: lessonNumber ? lessonNumber : 1
          });
        }

        userIds.map(async (userId) => {
          const user = await Users.findOne({ where: { id: userId } })
          await UserLesson.findOrCreate({
            where: {
              GroupCourseId: courseId,
              LessonId: lessonId,
              UserId: userId,
            },
            defaults: {
              GroupCourseId: courseId,
              LessonId: lessonId,
              points: 0,
              attempt: 1,
              UserId: userId,
            },
          });
        })
      }),
    );

    const parsedTrainers = JSON.parse(trainers);

    await Trainer.destroy({
      where: { courseId },
    });
    parsedTrainers.map(async (e, i) => {
      // const type = trainersImages[i].mimetype.split("/")[1];
      // const fileName = v4() + "." + type;
      // .mv(path.resolve(__dirname, "..", "static", fileName));

      await Trainer.create({
        fullName_en: e.fullName_en,
        fullName_ru: e.fullName_ru,
        fullName_am: e.fullName_am,
        img: trainersImages[i],
        profession_en: e.profession_en,
        profession_ru: e.profession_ru,
        profession_am: e.profession_am,
        courseId,
        type,
      });
    });
    const levelDescEn = JSON.parse(levelDescriptions_en);
    const levelDescRu = JSON.parse(levelDescriptions_ru);
    const levelDescAm = JSON.parse(levelDescriptions_am);

    await levelDescription.destroy({ where: { courseId } });

    levelDescEn.map(async (e, i) => {
      await levelDescription.create({
        title_en: e.title,
        description_en: e.description,
        title_ru: levelDescRu[i].title,
        description_ru: levelDescRu[i].description,
        title_am: levelDescAm[i].title,
        description_am: levelDescAm[i].description,
        courseId,
        type,
      });
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to update course.' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;

    const assignCourse = await Groups.findOne({
      where: {
        assignCourseId: id,
      },
    });

    if (assignCourse) {
      return res.status(403).json({
        message: 'This course is attached to a group, ungroup before deleting',
      });
    }

    const groupCourses = await GroupCourses.findOne({
      where: {
        id,
        creatorId: userId
      }
    });

    if (!groupCourses) {
      return res.status(400).json({
        success: false,
        message: "You do not have permission to delete this course."
      });
    };

    await UserCourses.destroy({
      where: { GroupCourseId: id }
    })

    await CoursesContents.destroy({
      where: { courseId: id },
    });

    await CoursesPerLessons.destroy({
      where: { courseId: id },
    });

    await Trainer.destroy({
      where: { courseId: id },
    });

    await UserHomework.destroy({
      where: { GroupCourseId: id }
    })

    await UserLesson.destroy({
      where: { GroupCourseId: id }
    })

    await UserPoints.destroy({
      where: { courseId: id }
    })

    await CoursesPerQuizz.destroy({
      where: { courseId: id }
    })

    await GroupCourses.destroy({
      where: { id: id }
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
    const { user_id: userId } = req.user;

    let course = await GroupCourses.findOne({
      where: { id },
      include: [
        {
          model: CoursesContents,
          attributes: { exclude: ['id', 'courseId', 'language'] },
          // where: { language },
        },
        {
          model: levelDescription,
          // attributes: ['title', 'description'],
        },
        {
          model: Lesson,
          attributes: ['id', [`title_en`, 'title'], ['description_en', 'description']],
          through: {
            attributes: ['id'],
          },
        },
        {
          model: Quizz,
          attributes: ['id', [`title_en`, 'title'], ['description_en', 'description']],
          through: { attributes: [] },
        },
      ],
      attributes: ['id', 'img'],
      order: [
        [CoursesContents, 'id', 'ASC']
      ]
    });

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const trainers = await Trainer.findAll({
      where: { courseId: id },
      // attributes: ['fullName', 'img', 'profession'],
    });

    course.Lesson = course.Lessons.sort((a, b) => a.CoursesPerLessons.id - b.CoursesPerLessons.id);

    course = {
      id: course.id,
      img: course.img,
      title_en: course.CoursesContents[0].title,
      description_en: course.CoursesContents[0].description,
      shortDescription_en: course.CoursesContents[0].shortDescription,
      shortDescription_am: course.CoursesContents[1].shortDescription,
      shortDescription_ru: course.CoursesContents[2].shortDescription,
      courseType: course.CoursesContents[0].courseType,
      lessonType: course.CoursesContents[0].lessonType,
      priceTitle_en: course.CoursesContents[0].priceTitle,
      priceTitle_am: course.CoursesContents[1].priceTitle,
      priceTitle_ru: course.CoursesContents[2].priceTitle,
      priceDescription_en: course.CoursesContents[0].priceDescription,
      priceDescription_am: course.CoursesContents[1].priceDescription,
      priceDescription_ru: course.CoursesContents[2].priceDescription,
      duration_en: course.CoursesContents[0].duration,
      duration_am: course.CoursesContents[1].duration,
      duration_ru: course.CoursesContents[2].duration,
      price: course.CoursesContents[0].price,
      discount: course.CoursesContents[0].discount,
      whyThisCourse_en: course.CoursesContents[0].whyThisCourse,
      level: course.CoursesContents[0].level,
      title_am: course.CoursesContents[1].title,
      description_am: course.CoursesContents[1].description,
      whyThisCourse_am: course.CoursesContents[1].whyThisCourse,
      title_ru: course.CoursesContents[2].title,
      description_ru: course.CoursesContents[2].description,
      whyThisCourse_ru: course.CoursesContents[2].whyThisCourse,
      levelDescriptions: course.levelDescriptions,
      maxQuizzPoint: course.CoursesContents[0].maxQuizzPoint,
      maxHomeworkPoint: course.CoursesContents[0].maxHomeworkPoint,
      maxInterviewPoint: course.CoursesContents[0].maxInterviewPoint,
      lessons: course.Lessons.map((lesson, index) => {
        const formattedLesson = {
          id: lesson.dataValues.id,
          title: lesson.dataValues.title,
          description: lesson.dataValues.description,
          number: index + 1,
          isOpen: true,
        };
        return formattedLesson;
      }),
      quizz: course.Quizzs[0] ? course.Quizzs[0] : [],
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
            [`title_${language}`, 'title'],
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

const getCourseTitlesForCreateGroup = async (req, res) => {
  try {

    const { user_id: userId } = req.user;

    const { language } = req.query;
    let courses = await UserCourses.findAll({
      where: { UserId: userId },
      attributes: ['id', ['UserId', 'userId']],
      include: [
        {
          model: GroupCourses,
          include: [
            {
              model: CoursesContents,
              where: { language },
              attributes: ["courseId", "title", "description"]
            },
          ],
        },
      ],

    });

    courses = courses.reduce((aggr, value) => {

      const content = {
        id: value.GroupCourse.CoursesContents[0].courseId,
        title: value.GroupCourse.CoursesContents[0].title,
        description: value.GroupCourse.CoursesContents[0].description,
      };
      aggr.push(content)
      return aggr
    }, [])

    const teacherCourses = await CoursesContents.findAll({
      where: {
        creatorId: userId,
        language
      },
      attributes: [["courseId", "id"], "title", "description"]
    });

    courses = [...teacherCourses, ...courses]
    courses = Array.from(
      new Map(courses.map(e => [e.id, e])).values()
    );

    const courseIds = courses.reduce((aggr, value) => {
      aggr.push(value.id)
      return aggr;
    }, []);

    const groups = await Groups.findAll({
      where: {
        assignCourseId: courseIds
      },
      attributes: ["finished", "assignCourseId"]
    });

    const groupFinihed = groups.reduce((aggr, value) => {
      aggr[value.assignCourseId] = value.finished
      return aggr
    }, {})

    courses = courses.reduce((aggr, value) => {
      if (groupFinihed[value.id] === true) {
        value.type = "finished"
      } else if (groupFinihed[value.id] === false) {
        value.type = "inProgress"
      } else {
        value.type = null
        aggr.push(value);
      };
      return aggr
    }, [])

    return res.status(200).json(courses);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
}

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
  getCourseTitleForTeacher,
  createTest,
  createCourse,
  updateCourse,
  getOneGroup,
  deleteCourse,
  getCourseForAdmin,
  getCourseTitlesForCreateGroup
};
