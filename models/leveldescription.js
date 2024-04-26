'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class levelDescription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  levelDescription.init({
    title_en: DataTypes.STRING,
    title_ru: DataTypes.STRING,
    title_am: DataTypes.STRING,
    description_en: DataTypes.STRING,
    description_ru: DataTypes.STRING,
    description_am: DataTypes.STRING,
    courseId: DataTypes.INTEGER,
    type:DataTypes.STRING,

  }, {
    sequelize,
    modelName: 'levelDescription',
  });
  return levelDescription;
};