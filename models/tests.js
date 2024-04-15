"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tests extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Tests.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      courseId: DataTypes.INTEGER,
      type:DataTypes.STRING,
      language: DataTypes.STRING,
      uuid:DataTypes.STRING,
      type: DataTypes.STRING,
      time: DataTypes.INTEGER,
      percent: {
        type: DataTypes.INTEGER,
        validate: {
          max: 100,
        },
      },
    },
    {
      sequelize,
      modelName: "Tests",
    }

  );

  const TestsQuizz = sequelize.define("TestsQuizz");

  Tests.hasMany(TestsQuizz,{foreignKey:'testId'});
  return Tests;
};
