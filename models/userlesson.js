"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserLesson extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserLesson.init(
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
      LessonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Lesson",
          key: "id",
        },
      },
      points: DataTypes.INTEGER,
      attempt: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserLesson",
    }
  );

  // const GroupCourses = sequelize.define("GroupCourses");
  // UserLesson.belongsTo(GroupCourses);

  const Lesson = sequelize.define("Lesson");
  UserLesson.belongsTo(Lesson);
  //

  //
  const Users = sequelize.define("Users");
  UserLesson.belongsTo(Users,{ onDelete: 'CASCADE' });

  return UserLesson;
};
