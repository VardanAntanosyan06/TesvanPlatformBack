"use strict";
const { Model } = require("sequelize");
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
        references: {
          model: "GroupCourses",
          key: "id",
        },
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      totalPoints: DataTypes.INTEGER,
      takenQuizzes: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserCourses",
    }
  );
  //
  const GroupCourses = sequelize.define("GroupCourses");
  UserCourses.belongsTo(GroupCourses);
  //

  //
  const Users = sequelize.define("Users");
  UserCourses.belongsTo(Users);
  //
  return UserCourses;
};
