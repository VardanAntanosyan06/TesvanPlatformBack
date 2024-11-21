'use strict';
const { Model } = require('sequelize');
const groups = require('./groups');
module.exports = (sequelize, DataTypes) => {
  class GroupCourses extends Model {
    static associate(models) {}
  }
  GroupCourses.init(
    {
      img: DataTypes.STRING,
      creatorId: DataTypes.INTEGER,
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'GroupCourses',
    },
  );
  const CoursesContents = sequelize.define('CoursesContents');

  GroupCourses.hasMany(CoursesContents, {
    foreignKey: 'courseId',
  });

  const CourseProgram = sequelize.define('CourseProgram');
  GroupCourses.hasMany(CourseProgram, {
    foreignKey: 'courseId',
  });

  const Users = sequelize.define('Users');
  GroupCourses.belongsToMany(Users, { through: 'UserCourses', as: 'courses' });

  const Lesson = sequelize.define('Lesson');
  const CoursesPerLessons = sequelize.define('CoursesPerLessons');
  // Lesson.belongsToMany(GroupCourses, { through: CoursesPerLessons,foreignKey:"lessonId" });
  GroupCourses.belongsToMany(Lesson, {
    through: 'CoursesPerLessons',
    foreignKey: 'courseId',
    otherKey: 'lessonId',
  });
  const Quizz = sequelize.define('Quizz');

  const Homework = sequelize.define('Homework');
  GroupCourses.hasMany(Homework, { foreignKey: 'courseId' });
  const PaymentWays = sequelize.define('PaymentWays', { as: 'payment' });
  GroupCourses.hasMany(PaymentWays, { foreignKey: 'groupId', as: 'payment' });
  const Groups = sequelize.define('Groups');
  GroupCourses.hasMany(Groups, { foreignKey: 'assignCourseId' });

  const levelDescription = sequelize.define('levelDescription');
  GroupCourses.hasMany(levelDescription, {
    foreignKey: 'courseId',
  });
  // const UserCourses = sequelize.define("UserCourses");
  // GroupCourses.hasMany(Paym);
  // //

  // Lesson.belongsToMany(GroupCourses, { through: CoursesPerLessons,foreignKey:"lessonId" });
  GroupCourses.belongsToMany(Quizz, {
    through: 'CoursesPerQuizz',
    foreignKey: 'courseId',
    otherKey: 'quizzId',
  });

  return GroupCourses;
};
