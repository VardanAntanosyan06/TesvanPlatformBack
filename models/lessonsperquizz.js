'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LessonsPerQuizz extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LessonsPerQuizz.init({
    quizzId: DataTypes.INTEGER,
    lessonId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'LessonsPerQuizz',
  });

  const Lesson = sequelize.define("Lesson");

  // LessonsPerQuizz.belongsTo(Lesson,{foreignKey:"lessonId"})
  return LessonsPerQuizz;
};