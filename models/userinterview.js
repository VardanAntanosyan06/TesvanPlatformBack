'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserInterview extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  UserInterview.init(
    {
      userId: DataTypes.INTEGER,
      points: DataTypes.INTEGER,
      courseId: DataTypes.INTEGER,
      calendarId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'UserInterview',
    },
  );
  return UserInterview;
};
