'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FAQ extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  FAQ.init({
    question_en: DataTypes.STRING,
    question_am: DataTypes.STRING,
    question_ru: DataTypes.STRING,
    answer_en: DataTypes.TEXT,
    answer_am: DataTypes.TEXT,
    answer_ru: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'FAQ',
  });
  return FAQ;
};