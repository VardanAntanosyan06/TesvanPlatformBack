"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GroupCourses extends Model {
    static associate(models) {}
  }
  GroupCourses.init(
    {
      bought: DataTypes.INTEGER,
      startDate: DataTypes.DATE,
      img: DataTypes.STRING,
      sale: DataTypes.INTEGER,
      trainers: DataTypes.ARRAY(DataTypes.INTEGER),
      maxPoints: DataTypes.INTEGER,
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
  GroupCourses.hasMany(Lesson, { as: "lessons", foreignKey: "courseId" });

  const Homework = sequelize.define("Homework");
  GroupCourses.hasMany(Homework, { foreignKey: "courseId" });

  // const UserCourses = sequelize.define("UserCourses");
  // GroupCourses.hasMany(UserCourses);
  // //

  return GroupCourses;
};
