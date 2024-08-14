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
    }
  }
  UserAnswersQuizz.init(
    {
      userId: DataTypes.INTEGER,
      testId: DataTypes.INTEGER,
      questionId: DataTypes.INTEGER,
      optionId: DataTypes.INTEGER,
      courseId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'UserAnswersQuizz',
    },
  );
  return UserAnswersQuizz;
};
