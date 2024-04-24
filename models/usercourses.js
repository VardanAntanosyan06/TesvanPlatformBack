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
      totalPoints: DataTypes.INTEGER,
      takenQuizzes: DataTypes.INTEGER,
      certification: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'UserCourses',
    },
  );

  const GroupCourses = sequelize.define('GroupCourses');
  const Groups = sequelize.define('Groups');
  const Users = sequelize.define('Users');

  // UserCourses.belongsTo(Groups, {
  //   foreignKey: 'GroupCourseId',
  // });
  UserCourses.belongsTo(Groups, { foreignKey: 'GroupCourseId'});

  UserCourses.belongsTo(GroupCourses);
  UserCourses.belongsTo(Users);

  return UserCourses;
};
