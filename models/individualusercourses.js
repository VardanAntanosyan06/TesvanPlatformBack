'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class IndividualUserCourses extends Model {
    static associate(models) {}
  }

  IndividualUserCourses.init(
    {
      individualCourseId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'IndividualUserCourses',
    },
  );
  const InvidualCourses = sequelize.define('InvidualCourses');
  IndividualUserCourses.belongsToMany(InvidualCourses, {
    through: 'IndividualUserCoursesPerCourse',
    foreignKey: 'individualUserCourseId',
  });
  return IndividualUserCourses;
};
