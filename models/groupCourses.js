'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupCourses extends Model {
    static associate(models) {
    }
  }
  GroupCourses.init({
    bought: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    img: DataTypes.STRING,
    sale: DataTypes.INTEGER,
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'GroupCourses',
  });
  const CoursesContents = sequelize.define("CoursesContents")

  GroupCourses.hasMany(CoursesContents,{
    foreignKey:"courseId"
  })

  const CourseProgram = sequelize.define('CourseProgram');

  GroupCourses.hasMany(CourseProgram, {
    foreignKey: "courseId"
  })
  
  return GroupCourses;
};