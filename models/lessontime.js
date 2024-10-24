'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LessonTime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LessonTime.belongsTo(models.Users, { foreignKey: "userId", as: "lessonTime" })
    }
  }
  LessonTime.init({
    lessonId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    time: DataTypes.INTEGER,
    courseId: DataTypes.INTEGER,
    number: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'LessonTime',
  });
  return LessonTime;
};