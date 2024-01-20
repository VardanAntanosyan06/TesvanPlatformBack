"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Homework extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Homework.init(
    {
      courseId: DataTypes.INTEGER,
      title_en: DataTypes.STRING,
      description_en: DataTypes.TEXT("long"),
      title_ru: DataTypes.STRING,
      description_ru: DataTypes.TEXT("long"),
      title_am: DataTypes.STRING,
      description_am: DataTypes.TEXT("long"),
      maxPoints: DataTypes.INTEGER,
      isOpen: DataTypes.BOOLEAN,
      dueDate:DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Homework",
    }
  );

  const GroupCourses = sequelize.define("GroupCourses");
  const UserHomeworks = sequelize.define("UserHomework");
  const Users = sequelize.define("Users");
  const UserHomework = sequelize.define("UserHomework");
  const HomeWorkFiles = sequelize.define("HomeWorkFiles");
  
  Homework.belongsTo(GroupCourses, { foreignKey: "id" });
  Homework.belongsToMany(Users, { through: "UserHomework" });  
  Homework.hasOne(UserHomework,{foreignKey:"HomeworkId"});
  Homework.hasMany(UserHomeworks,{foreignKey:'HomeworkId'})
  // Homework.hasMany(UserHomeworks,{foreignKey:'HomeworkId'})
  Homework.hasMany(HomeWorkFiles,{foreignKey:'homeWorkId'})

  return Homework;
};
