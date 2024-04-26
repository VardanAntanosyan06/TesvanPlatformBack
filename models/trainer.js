"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Trainer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Trainer.init(
    {
      fullName_en: DataTypes.STRING,
      fullName_ru: DataTypes.STRING,
      fullName_am: DataTypes.STRING,
      img: DataTypes.STRING,
      profession_en: DataTypes.STRING,
      profession_ru: DataTypes.STRING,
      profession_am: DataTypes.STRING,
      courseId:DataTypes.INTEGER,
      type:DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Trainer",
    }
  );

  return Trainer;
};
