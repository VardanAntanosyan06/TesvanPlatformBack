"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Lesson extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Lesson.init(
    {
      title_en: DataTypes.STRING,
      description_en: DataTypes.TEXT("long"),
      title_ru: DataTypes.STRING,
      description_ru: DataTypes.TEXT("long"),
      title_am: DataTypes.STRING,
      description_am: DataTypes.TEXT("long"),
      maxPoints: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Lesson",
    }
  );

  const GroupCourses = sequelize.define("GroupCourses");
  Lesson.belongsTo(GroupCourses, { foreignKey: "id" });

  const Users = sequelize.define("Users");
  Lesson.belongsToMany(Users, { through: "UserLesson" });

  const Quizz = sequelize.define("Quizz");
  Lesson.hasOne(Quizz, { foreignKey: "lessonId", as: "quizz" });

  const Video = sequelize.define("Video");
  Lesson.hasOne(Video, { foreignKey: "lessonId", as: "video" });

  const CoursesPerLessons = sequelize.define("CoursesPerLessons")
  Lesson.hasMany(CoursesPerLessons)

  return Lesson;
};
