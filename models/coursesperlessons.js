'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CoursesPerLessons extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CoursesPerLessons.init({
    courseId: DataTypes.INTEGER,
    lessonId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CoursesPerLessons',
  });
  
  const Lesson = sequelize.define("Lesson")
  
  CoursesPerLessons.hasMany(Lesson)
  return CoursesPerLessons;
};