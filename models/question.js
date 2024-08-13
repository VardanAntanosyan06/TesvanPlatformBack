'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Question.init(
    {
      quizzId: DataTypes.INTEGER,
      title_en: DataTypes.TEXT('long'),
      title_ru: DataTypes.TEXT('long'),
      title_am: DataTypes.TEXT('long'),
      points: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: 'Question',
    },
  );

  const Quizz = sequelize.define('Quizz');
  Question.belongsTo(Quizz, { foreignKey: 'id' });

  const Option = sequelize.define('Option');
  Question.hasMany(Option, { foreignKey: 'questionId', onDelete: 'cascade' });

  return Question;
};
