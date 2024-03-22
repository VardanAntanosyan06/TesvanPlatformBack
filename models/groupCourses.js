"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GroupCourses extends Model {
    static associate(models) {}
  }
  GroupCourses.init(
    {
      img: DataTypes.STRING,
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,

      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "GroupCourses",
    }
  );
  const CoursesContents = sequelize.define("CoursesContents");

  GroupCourses.hasMany(CoursesContents, {
    foreignKey: "courseId",
  });

  const CourseProgram = sequelize.define("CourseProgram");
  GroupCourses.hasMany(CourseProgram, {
    foreignKey: "courseId",
  });

  const Users = sequelize.define("Users");
  GroupCourses.belongsToMany(Users, { through: "UserCourses", as: "courses" });

  const Lesson = sequelize.define("Lesson");
  const CoursesPerLessons = sequelize.define("CoursesPerLessons")
  // Lesson.belongsToMany(GroupCourses, { through: CoursesPerLessons,foreignKey:"lessonId" });
  GroupCourses.belongsToMany(Lesson, {
    through: 'CoursesPerLessons',
    foreignKey: 'courseId',
    otherKey: 'lessonId' 
  });
  const Homework = sequelize.define("Homework");
  GroupCourses.hasMany(Homework, { foreignKey: "courseId" });

  const Groups = sequelize.define("Groups");
  GroupCourses.hasMany(Groups, { foreignKey: "assignCourseId" });
  // const UserCourses = sequelize.define("UserCourses");
  // GroupCourses.hasMany(UserCourses);
  // //

  return GroupCourses;
};
