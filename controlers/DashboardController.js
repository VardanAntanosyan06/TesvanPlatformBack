const { where } = require('sequelize');
const {
  Users,
  Groups,
  GroupsPerUsers,
  GroupCourses,
  CoursesContents,
  CoursesPerLessons,
  Skills,
  LessonTime,
  Lesson,
  UserCourses,
  Homework,
  UserHomework,
  Quizz,
  Question
} = require('../models');
const sequelize = require('sequelize');

const getUserStatictis = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;
    const { user_id: userId } = req.user;


    let course = await Groups.findByPk(id, {
      include: [
        {
          model: GroupCourses,
          include: {
            model: CoursesContents,
          },
        },
      ],
    });

    const isIndividual = await UserCourses.findOne({
      where: {
        UserId: userId,
        GroupCourseId: course.assignCourseId,
      },
      include: [CoursesContents],
    });
    const userCoursPoints = +isIndividual.totalPoints
    const userCoursQuizzPoints = +isIndividual.takenQuizzes
    const userCoursHomeworkPoints = +isIndividual.takenHomework

    if (
      isIndividual &&
      isIndividual.CoursesContent &&
      isIndividual.CoursesContent.courseType == 'Individual'
    ) {

      let course = await GroupCourses.findByPk(id, {
        include: {
          model: CoursesContents,
        },
      });
      const students = await UserCourses.count({
        where: { GroupCourseId: course.assignCourseId },
      });

      const lessons = await CoursesPerLessons.count({
        where: {
          courseId: course.assignCourseId,
        },
      });

      const mySkils = await Skills.findAll({
        where: { userId },
      })

      let charts = await LessonTime.findAll({
        where: {
          userId,
        },
      });

      charts = charts.map((e) => e.time);
      const allQuizz = await CoursesPerLessons.count({
        where: { courseId: course.assignCourseId },
        include: [
          {
            model: Lesson,
            include: [
              {
                model: Quizz,
                as: 'quizz',
                required: true,
              },
            ],
            required: true,
          },
        ],
      });
      //const language = "am";
      const allHomework = await CoursesPerLessons.count({
        where: { courseId: course.assignCourseId },
        include: [
          {
            model: Lesson,
            include: [
              {
                model: Homework,
                as: 'homework',
                through: {
                  attributes: [],
                },
                attributes: [
                  'id',
                  [`title_${language}`, 'title'],
                  [`description_${language}`, 'description'],
                ],
              },
            ],
            required: true,
          },
        ],
      });

      const userSubmitedHomework = 5;
      const response = {
        lesson: 0,
        homework: {
          taken: 1,
          all: allQuizz,
          percent: 100,
        },
        quizzes: {
          taken: userSubmitedHomework,
          all: allHomework,
          percent: (userSubmitedHomework / allHomework) * 100,
        },
        // totalPoints: (group.lessons + group.homeWork + group.quizzes) / 3,
        totalPoints: 0,
        mySkils,
        charts,
        course: {
          students,
          lessons,
          lessonType: isIndividual.CoursesContent.level,
        },
      };

      return res.json(response);
    }

    const group = await GroupsPerUsers.findOne({
      where: {
        userId,
        groupId: id,
      },
    });
    const students = await GroupsPerUsers.count({
      where: { groupId: id, userRole: 'STUDENT' },
    });

    const lessons = await CoursesPerLessons.count({
      where: {
        courseId: course.assignCourseId ? course.assignCourseId : 1,
      },
    });

    const maxPoint = await CoursesContents.findOne({
      where: {
        courseId: course.assignCourseId
      }
    })
    console.log(maxPoint.maxQuizzPoint, maxPoint.maxInterviewPoint, maxPoint.maxHomeworkPoint);



    if (!group) {
      return res.status(403).json({
        success: false,
        message: "Group not found or user doesn't in group",
      });
    }
    const mySkils = await Skills.findAll({
      where: { userId },
    });

    let charts = await LessonTime.findAll({
      where: {
        userId,
      },
    });

    charts = charts.map((e) => e.time);

    const response = {
      lesson: 0,
      homework: {
        maxHomevorkPoint: +maxPoint.maxHomeworkPoint,
        userCoursHomeworkPoints: parseFloat(userCoursHomeworkPoints.toFixed(2)),
      },
      quizzes: {
        maxQuizzPoint: +maxPoint.maxQuizzPoint,
        userCoursQuizzPoints: parseFloat(userCoursQuizzPoints.toFixed(2)),
      },
      interview: {
        maxInterviewPoint: +maxPoint.maxInterviewPoint,
        userCoursInterviewPoint: 0
      },

      totalPoints: parseFloat(userCoursPoints.toFixed(2)),
      maxTotalPoints: +maxPoint.maxInterviewPoint + +maxPoint.maxQuizzPoint + +maxPoint.maxHomeworkPoint,
      mySkils,
      charts,
      course: {
        students,
        lessons: lessons,
        lessonType: course.GroupCourse.CoursesContents[0].level,
      },
    };
    return res.json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Something Went Wrong' });
  }
};

const getInvidualCourseStatics = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;

    const courses = await CoursesContents.findOne({
      where: {
        userId,
        courseType: 'Individual',
      },
    });
    const courseType = courses.courseType;
    let course = await CoursesContents.findOne({ where: { id } });
    const lessons = await CoursesPerLessons.count({
      where: {
        courseId: course,
      },
    });

    const mySkils = await Skills.findAll({
      where: { userId },
    });

    let charts = await LessonTime.findAll({
      where: {
        userId,
      },
    });

    charts = charts.map((e) => e.time);

    const response = {
      lesson: course.lessons,
      homeWork: course.homeWork,
      quizzes: course.quizzes,
      totalPoints: (course.lessons + course.homeWork + course.quizzes) / 3,
      mySkils,
      charts,
      course: {
        courseType,
        lessons,
        lessonType: course.GroupCourse.CoursesContents[0].level,
      },
    };
    return res.json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong .' });
  }
};

const getAdminStatistics = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
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
    }, [])

    const groups = await Groups.findAll({
      where: {
        creatorId: [+userId, ...teacherIds]
      },
      include: [
        {
          model: GroupsPerUsers,
          required: true,
          attributes: ["id"]
        },
      ],
      attributes: ["id"]
    })

    const students = groups.reduce((aggr, value) => {
      value.GroupsPerUsers.length
      return aggr += value.GroupsPerUsers.length
    }, 0)

    return res.status(200).json({
      success: true,
      studentsCount: students,
      teachersCount: teacher.length,
      groupsCount: groups.length
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong .' });
  }
}

const getSuperAdminStatistics = async (req, res) => {
  try {
    const { user_id: userId } = req.user;



    const admins = await Users.findAll({
      where: {
        creatorId: userId,
        role: "ADMIN"
      },
      attributes: ["id"],
      include: [
        {
          model: Users,
          as: "teachers",
          where: {
            role: "TEACHER"
          },
          attributes: ["id"],
        }
      ]
    })

    let teacherIds = admins.reduce((aggr, value) => {
      aggr = [...aggr, ...value.teachers]
      return aggr;
    }, []);


    const groups = await UserCourses.findAll({
      where: {
        UserId: userId,
      },
      attributes: ['GroupCourseId'],
      include: [
        {
          model: Groups,
          attributes: ['name', 'finished', 'createdAt'],
        },
      ],
    });

    return res.send(admins, groups)


  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong .' });
  }
}

module.exports = {
  getUserStatictis,
  getInvidualCourseStatics,
  getAdminStatistics,
  getSuperAdminStatistics
};
