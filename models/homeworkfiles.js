'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HomeWorkFiles extends Model {
    static associate(models) {
    }
  }
  HomeWorkFiles.init({
    fileName: DataTypes.STRING,
    fileLink: DataTypes.STRING,
    homeWorkId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    courseId: DataTypes.INTEGER
  },{
    sequelize,
    modelName: 'HomeWorkFiles',
  });

  return HomeWorkFiles;
};