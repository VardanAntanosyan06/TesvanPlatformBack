'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserPoints extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserPoints.init({
    userId: DataTypes.INTEGER,
    quizzId: DataTypes.INTEGER,
    point:DataTypes.INTEGER,
    courseId:DataTypes.INTEGER,
    isFinal:DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'UserPoints',
  });
  return UserPoints;
};