"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserHomework extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserHomework.init(
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
      startDate:DataTypes.DATE,
      feedback:DataTypes.TEXT,
      HomeworkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Homework",
          key: "id",
        },
      },
      answer: DataTypes.TEXT("long"),
      points: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
      LessonId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserHomework",
    }
  );

  const Homework = sequelize.define("Homework");
  UserHomework.belongsTo(Homework, { foreignKey: 'HomeworkId' });

  const Users = sequelize.define("Users");
  UserHomework.belongsTo(Users);

  const HomeWorkFiles = sequelize.define("HomeWorkFiles");
  UserHomework.hasMany(HomeWorkFiles,{foreignKey:"homeWorkId"});

  return UserHomework;
};
