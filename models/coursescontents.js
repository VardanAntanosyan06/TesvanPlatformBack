'use strict';
const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CoursesContents extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CoursesContents.hasOne(models.Groups, { foreignKey: 'assignCourseId'})
    }
  }
  CoursesContents.init(
    {
      courseId: DataTypes.INTEGER,
      type: DataTypes.STRING,
      language: {
        type: DataTypes.STRING,
        isIn: {
          args: [['en,ru,am']],
          msg: 'Language must be en,ru  or am',
        },
      },
      title: DataTypes.STRING,
      description: DataTypes.TEXT('long'),
      courseType: DataTypes.STRING,
      lessonType: DataTypes.STRING,
      shortDescription: DataTypes.STRING,
      priceTitle: DataTypes.STRING,
      priceDescription: DataTypes.STRING,
      duration: { type: DataTypes.INTEGER, allowNull: true },
      price: { type: DataTypes.INTEGER, allowNull: true },
      discount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      whyThisCourse: DataTypes.ARRAY(DataTypes.TEXT('long')),
      level: DataTypes.STRING,
      levelDescriptions: DataTypes.ARRAY(DataTypes.STRING),
      type: DataTypes.STRING,
      maxQuizzPoint: DataTypes.STRING,
      maxHomeworkPoint: DataTypes.STRING,
      maxInterviewPoint: DataTypes.STRING,
      creatorId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'CoursesContents',
      timestamps: false,
    },
  );

  const InvidualCourses = sequelize.define('InvidualCourses');
  CoursesContents.hasOne(InvidualCourses, {
    foreignKey: 'id',
  });

  const GroupCourses = sequelize.define('GroupCourses');

  CoursesContents.hasOne(GroupCourses, {
    foreignKey: 'id',
  });
  const Levels = sequelize.define('Levels');

  CoursesContents.hasOne(Levels, {
    foreignKey: 'slug',
    sourceKey: 'level',
  });

  return CoursesContents;
};
