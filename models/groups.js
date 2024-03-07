'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Groups extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Groups.init({
    name: DataTypes.STRING,
    assignCourseId:DataTypes.INTEGER,
    groupeKey:DataTypes.STRING,
    finished:DataTypes.BOOLEAN,
    startDate:DataTypes.DATE,
    endDate:DataTypes.DATE,
    price:DataTypes.INTEGER,
    sale:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Groups',
  });

  const UserCourses = sequelize.define("UserCourses")
  Groups.hasMany(UserCourses,{foreignKey:"GroupCourseId"})

  const GroupCourses = sequelize.define("GroupCourses")
  Groups.belongsTo(GroupCourses,{foreignKey:"assignCourseId"})

  const CoursesContents = sequelize.define("CoursesContents")
  Groups.belongsTo(CoursesContents,{foreignKey:"assignCourseId"})
  const GroupsPerUsers = sequelize.define("GroupsPerUsers")
  Groups.hasMany(GroupsPerUsers,{foreignKey:"groupId"})

  return Groups;
};