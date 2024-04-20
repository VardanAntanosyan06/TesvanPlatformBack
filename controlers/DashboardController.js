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
} = require('../models');
// const  = require("../models/groupCourses");

const getUserStatictis = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;

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
      return res.json({
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

module.exports = {
  getUserStatictis,
};
