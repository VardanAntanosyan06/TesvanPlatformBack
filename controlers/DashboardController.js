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
  Question,
  UserStatus
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

    const userCourse = await UserCourses.findOne({
      where: {
        UserId: userId,
        GroupCourseId: course.assignCourseId,
      },
      include: [CoursesContents],
    });
    const userCoursPoints = +userCourse.totalPoints
    const userCoursQuizzPoints = +userCourse.takenQuizzes
    const userCoursHomeworkPoints = +userCourse.takenHomework
    const userCoursInterviewPoint = +userCourse.takenInterview

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
        userCoursInterviewPoint: parseFloat(userCoursInterviewPoint.toFixed(2)),
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
          where: {
            userRole: "STUDENT"
          },
          required: false,
          attributes: ["id"]
        },
      ],
      attributes: ["id"]
    })

    const students = groups.reduce((aggr, value) => {
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
          required: false
        },
        {
          model: UserStatus,
          as: "userStatus",
          attributes: ["isActive", "endDate"],
        }
      ]
    })

    const teacherdate = admins.reduce((aggr, value) => {
      aggr = [...aggr, ...value.teachers]
      return aggr;
    }, []);

    const teacherIds = Array.from(
      new Map(teacherdate.map(value => [value.id, value])).keys()
    )

    const adminIds = Array.from(
      new Map(admins.map(value => [value.id, value])).keys()
    )

    const groups = await Groups.findAll({
      where: { creatorId: [...teacherIds, userId, ...adminIds] },
      include: [
        {
          model: GroupsPerUsers,
          where: {
            userRole: "STUDENT"
          },
          attributes: ['id', 'userId'],
          include: {
            model: Users,
            attributes: ['id', 'firstName', 'lastName', 'role', 'image'],
          },
          required: false
        },
      ],
    });

    const course = await GroupCourses.count({
        where: { creatorId: [...teacherIds, userId, ...adminIds] },
    })

    const userData = groups.reduce((aggr, value) => {
      aggr = [...aggr, ...value.GroupsPerUsers]
      return aggr;
    }, []);

    // const userIds = Array.from(
    //   new Map(userData.map(value => [value.User.id, value.User])).keys()
    // );

    const subscribers = admins.reduce((aggr, value) => {
      if (value.userStatus.isActive) {
        aggr.push(value);
      };
      return aggr
    }, [])   

    return res.status(200).json({
      adminCount: adminIds.length,
      teacherCount: teacherIds.length,
      groupCount: groups.length,
      studentCount: userData.length,
      subscriberCount: subscribers.length,
      courseCount: course
    })

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
