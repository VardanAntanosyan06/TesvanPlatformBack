'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Careers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Careers.init({
    title_en: DataTypes.STRING,
    description_en: DataTypes.TEXT,
    title_am: DataTypes.STRING,
    description_am: DataTypes.TEXT,
    title_ru: DataTypes.STRING,
    description_ru: DataTypes.TEXT,
    term: DataTypes.STRING,
    type: DataTypes.STRING,
    location: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Careers',
  });
  return Careers;
};