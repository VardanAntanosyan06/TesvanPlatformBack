'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserAnswersQuizz extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserAnswersQuizz.belongsTo(models.Quizz, { foreignKey: 'testId', as: 'quizz' });
      UserAnswersQuizz.belongsTo(models.Question, { foreignKey: 'questionId', as: 'question' });
      UserAnswersQuizz.hasMany(models.UserAnswersOption, {foreignKey: 'userAnswerQuizzId', as: 'userAnswersOption', onDelete: 'cascade' })
    }
  }

  UserAnswersQuizz.init({
    userId: DataTypes.INTEGER,
    testId: DataTypes.INTEGER,
    questionId: DataTypes.INTEGER,
    optionId: DataTypes.INTEGER,
    courseId: DataTypes.INTEGER,
    lessonId: DataTypes.INTEGER,
    questionTitle_en: DataTypes.STRING,
    questionTitle_am: DataTypes.STRING, 
    questionTitle_ru: DataTypes.STRING,
    point: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'UserAnswersQuizz',
  });

  return UserAnswersQuizz;
};
