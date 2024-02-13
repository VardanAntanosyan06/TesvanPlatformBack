"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {}
  }
  Users.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            args: true,
            msg: "Incorrect email format.",
          },
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      birthday: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: {
            args: [["Male", "Female", "Other"]],
            msg: "gender must be 'Male', 'Female', 'Other'",
          },
        },
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      englishLevel: {
        type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        validate: {
          isIn: {
            args: [["A1", "A2", "B1", "B2", "C1", "C2"]],
            msg: "English Level must be 'A1','A2','B1','B2','C1'or 'C2'",
          },
        },
      },
      education: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      backgroundInQA: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      role: {
        type: DataTypes.STRING,
        validate: {
          isIn: {
            args: [["TEACHER", "STUDENT"]],
            msg: "Role must be 'TEACHER' or 'STUDENT'",
          },
        },
        allowNull: false,
      },
      image:{
        type: DataTypes.STRING,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tokenCreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      likedCourses: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "Users",
    }
  );

  const userLikes = sequelize.define("UserLikes");
  Users.hasMany(userLikes, {
    foreignKey: "id",
  });

  const GroupCourses = sequelize.define("GroupCourses");
  Users.belongsToMany(GroupCourses, { through: "UserCourses", as: "courses" });

  //
  // const UserCourses = sequelize.define("UserCourses");
  // Users.hasMany(UserCourses);
  //

  const Lessons = sequelize.define("Lessons");
  Users.belongsToMany(Lessons, { through: "UserLesson" });

  const Homework = sequelize.define("Homework");
  Users.belongsToMany(Homework, { through: "UserHomework" });

  const Message = sequelize.define("Message");
  Users.hasMany(Message);
  
  const UserCourses = sequelize.define("UserCourses");
  Users.hasMany(UserCourses);
  return Users;
};
