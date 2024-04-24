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
  UserCourses,
} = require('../models');
// const  = require("../models/groupCourses");

const getUserStatictis = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;

    const isIndividual = await UserCourses.findOne({
      where: {
        UserId: userId,
        GroupCourseId: id,
      },
      include: [CoursesContents],
    });

    if (
      isIndividual &&
      isIndividual.CoursesContent &&
      isIndividual.CoursesContent.courseType == 'Individual'
    ) {
      const students = await UserCourses.count({ where: { GroupCourseId: id } });

      let course = await GroupCourses.findByPk(id, {
        // include: [
        // {
        // model: ,
        include: {
          model: CoursesContents,
        },
        // },
        // ],
      });
      const lessons = await CoursesPerLessons.count({
        where: {
          courseId: id,
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
        lesson: 0,
        homeWork: 0,
        quizzes: 0,
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
    const students = await GroupsPerUsers.count({ where: { groupId: id } });

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
    const lessons = await CoursesPerLessons.count({
      where: {
        courseId: course.assignCourseId,
      },
    });

    if (!group)
      return res.status(403).json({
        success: false,
        message: "Group not found or user doesn't in group",
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
      lesson: group.lessons,
      homeWork: group.homeWork,
      quizzes: group.quizzes,
      totalPoints: (group.lessons + group.homeWork + group.quizzes) / 3,
      mySkils,
      charts,
      course: {
        students,
        lessons,
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

module.exports = {
  getUserStatictis,
  getInvidualCourseStatics,
};
