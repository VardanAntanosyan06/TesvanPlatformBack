'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Levels extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Levels.init({
    slug:DataTypes.STRING,
    am: DataTypes.STRING,
    ru: DataTypes.STRING,
    en: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Levels',
    timestamps:false
  });
  // const CoursesContents = sequelize.define("CoursesContents")

  // Levels.hasOne(CoursesContents,{
  //   foreignKey:"slug"
  // })
  return Levels;
};