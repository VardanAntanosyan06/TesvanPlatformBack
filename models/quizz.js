"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Quizz extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Quizz.init(
    {
      title_en: DataTypes.STRING,
      description_en: DataTypes.TEXT("long"),
      title_ru: DataTypes.STRING,
      description_ru: DataTypes.TEXT("long"),
      title_am: DataTypes.STRING,
      description_am: DataTypes.TEXT("long"),
    },
    {
      sequelize,
      modelName: "Quizz",
    }
  );

  const Lesson = sequelize.define("Lesson");
  // HasMany
  Quizz.belongsTo(Lesson, { foreignKey: "id", as: "quizz" });

  const Question = sequelize.define("Question");
  Quizz.hasMany(Question, { foreignKey: "quizzId", as: "questions" });

  return Quizz;
};
