'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TestsQuizzOptions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TestsQuizzOptions.init({
    questionId: DataTypes.INTEGER,
    option: DataTypes.STRING,
    isCorrect: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'TestsQuizzOptions',
  });
  const TestsQuizz = sequelize.define('TestsQuizz')
  return TestsQuizzOptions;
};