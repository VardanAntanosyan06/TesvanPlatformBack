'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HomeWorkFiles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  HomeWorkFiles.init({
    fileName: DataTypes.STRING,
    fileLink: DataTypes.STRING,
    homeWorkId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'HomeWorkFiles',
  });
  const Homework = sequelize.define("Homework")
  return HomeWorkFiles;
};