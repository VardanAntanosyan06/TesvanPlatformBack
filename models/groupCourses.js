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
    sale: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GroupCourses',
  });
  const CoursesContents = sequelize.define("CoursesContents")

  GroupCourses.hasMany(CoursesContents,{
    foreignKey:"courseId"
  })
  
  return GroupCourses;
};