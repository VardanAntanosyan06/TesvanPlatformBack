'use strict';
const { Model } = require('sequelize');
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
  HomeworkPerLesson.init(
    {
      homeworkId: DataTypes.INTEGER,
      lessonId: DataTypes.INTEGER,
      maxPoints: DataTypes.INTEGER,
      startDate: DataTypes.DATE,
      isOpen: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'HomeworkPerLesson',
    },
  );
  return HomeworkPerLesson;
};
