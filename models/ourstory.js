'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OurStory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OurStory.init({
    year: DataTypes.STRING,
    description_en: DataTypes.TEXT,
    description_am: DataTypes.TEXT,
    description_ru: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'OurStory',
  });
  return OurStory;
};