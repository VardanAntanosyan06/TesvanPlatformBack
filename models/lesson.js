'use strict';
const { Model } = require('sequelize');
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
      description_en: DataTypes.TEXT('long'),
      title_ru: DataTypes.STRING,
      description_ru: DataTypes.TEXT('long'),
      title_am: DataTypes.STRING,
      description_am: DataTypes.TEXT('long'),
      maxPoints: DataTypes.INTEGER,
      htmlContent_en: DataTypes.TEXT('long'),
      htmlContent_ru: DataTypes.TEXT('long'),
      htmlContent_am: DataTypes.TEXT('long'),
    },
    {
      sequelize,
      modelName: 'Lesson',
    },
  );

  const GroupCourses = sequelize.define('GroupCourses');
  // Lesson.belongsTo(GroupCourses, { foreignKey: "id" });

  const Users = sequelize.define('Users');
  Lesson.belongsToMany(Users, { through: 'UserLesson' });

  const Quizz = sequelize.define('Quizz');
  const LessonsPerQuizz = sequelize.define('LessonsPerQuizz');
  const HomeworkPerLesson = sequelize.define('HomeworkPerLesson');
  const Homework = sequelize.define('Homework');
  // Lesson.hasOne(Quizz, { foreignKey: "lessonId", as: "quizz" });

  const Video = sequelize.define('Video');
  Lesson.hasOne(Video, { foreignKey: 'lessonId', as: 'video' });

  const CoursesPerLessons = sequelize.define('CoursesPerLessons');

  Lesson.belongsToMany(GroupCourses, {
    through: CoursesPerLessons,
    foreignKey: 'courseId', // Specify lowercase column name
    otherKey: 'lessonId', // Assuming the column name in GroupCourse is 'id'
  });

  Lesson.belongsToMany(Quizz, {
    through: LessonsPerQuizz,
    foreignKey: 'lessonId',
    otherKey: 'quizzId',
    as: 'quizz',
  });

  Lesson.belongsToMany(Homework, {
    through: HomeworkPerLesson,
    foreignKey: 'lessonId',
    otherKey: 'homeworkId',
    as: 'homework',
  });

  const Presentations = sequelize.define('Presentations');
  Lesson.hasMany(Presentations, {
    foreignKey: 'lessonId',
  });
  return Lesson;
};
