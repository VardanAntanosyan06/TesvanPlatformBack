'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HomeworkPerLesson extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  HomeworkPerLesson.init({
    lessonId: DataTypes.INTEGER,
    homeworkId: DataTypes.INTEGER,
    maxPoints: DataTypes.INTEGER,
    dueDate: DataTypes.DATE,
    startDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'HomeworkPerLesson',
  });
  return HomeworkPerLesson;
};