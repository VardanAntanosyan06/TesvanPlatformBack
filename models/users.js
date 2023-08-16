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
        unique:true,
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
            args: [["Teacher", "Student"]],
            msg: "Role must be 'Teacher' or 'Student'",
          },
        },
        allowNull:false
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tokenCreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Users",
    }
  );
  return Users;
};
