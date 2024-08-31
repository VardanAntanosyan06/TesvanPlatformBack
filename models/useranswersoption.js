'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserAnswersOption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserAnswersOption.belongsTo(models.UserAnswersQuizz, {foreignKey: 'userAnswerQuizzId', onDelete: 'cascade' })
    }
  }
  UserAnswersOption.init({
    userAnswerQuizzId: DataTypes.INTEGER,
    title_en: DataTypes.STRING,
    title_am: DataTypes.STRING,
    title_ru: DataTypes.STRING,
    isCorrect: DataTypes.BOOLEAN,
    userAnswer: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'UserAnswersOption',
  });
  return UserAnswersOption;
};