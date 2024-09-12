'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserCourses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserCourses.belongsTo(models.Users, { foreignKey: "UserId", onDelete: 'CASCADE' });
    }
  }
  UserCourses.init(
    {
      GroupCourseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalPoints: DataTypes.DECIMAL,
      takenQuizzes: DataTypes.DECIMAL,
      certification: DataTypes.STRING,
      takenHomework: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: 'UserCourses',
    },
  );

  const GroupCourses = sequelize.define('GroupCourses');
  const Groups = sequelize.define('Groups');
  const Users = sequelize.define('Users');
  const CoursesContents = sequelize.define('CoursesContents');

  // UserCourses.belongsTo(Groups, {
  //   foreignKey: 'GroupCourseId',
  // });
  UserCourses.belongsTo(Groups, { foreignKey: 'GroupCourseId' });
  UserCourses.belongsTo(Groups, { foreignKey: 'GroupCourseId' });

  UserCourses.belongsTo(GroupCourses);
  UserCourses.belongsTo(CoursesContents, { foreignKey: 'GroupCourseId' });

  return UserCourses;
};
