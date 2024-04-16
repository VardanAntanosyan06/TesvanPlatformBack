'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CoursesPerQuizz extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CoursesPerQuizz.init(
    {
      courseId: DataTypes.INTEGER,
      type: DataTypes.STRING,
      quizzId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'CoursesPerQuizz',
    },
  );
  return CoursesPerQuizz;
};
