'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TestsQuizz extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TestsQuizz.init({
    question: DataTypes.STRING,
    testId: DataTypes.INTEGER,
    language: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TestsQuizz',
  });
  
  const Tests = sequelize.define("Tests")
  const TestsQuizzOptions = sequelize.define("TestsQuizzOptions")

  TestsQuizz.hasMany(TestsQuizzOptions,{foreignKey:"questionId"})
  return TestsQuizz;
};