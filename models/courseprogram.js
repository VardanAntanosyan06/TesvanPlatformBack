"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CourseProgram extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CourseProgram.init(
    {
      courseId:DataTypes.INTEGER,
      language: {
        type: DataTypes.STRING,
        isIn: {
          args: [["en,ru,am"]],
          msg: "Language must be en,ru  or am",
        },
      },
      title: DataTypes.STRING,
      description: DataTypes.TEXT("long"),
    },
    {
      sequelize,
      modelName: "CourseProgram",
      timestamps: false
    }
  );
  
  const GroupCourses = sequelize.define("GroupCourses")
  
  CourseProgram.hasOne(GroupCourses,{
    foreignKey:"id"
  })

  return CourseProgram;
};


