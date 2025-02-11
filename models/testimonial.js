'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Testimonial extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Testimonial.init({
    fullName_en: DataTypes.STRING,
    fullName_am: DataTypes.STRING,
    fullName_ru: DataTypes.STRING,
    staff: DataTypes.STRING,
    testimonial_en: DataTypes.TEXT,
    testimonial_am: DataTypes.TEXT,
    testimonial_ru: DataTypes.TEXT,
    img: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Testimonial',
  });
  return Testimonial;
};