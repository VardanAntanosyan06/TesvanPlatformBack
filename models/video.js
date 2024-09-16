"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Video extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Video.belongsTo(models.Lesson, {foreignKey: "lessonId"});
    }
  }
  Video.init(
    {
      lessonId: DataTypes.INTEGER,
      url: DataTypes.STRING,
      title_en: DataTypes.STRING,
      description_en: DataTypes.TEXT("long"),
      title_ru: DataTypes.STRING,
      description_ru: DataTypes.TEXT("long"),
      title_am: DataTypes.STRING,
      description_am: DataTypes.TEXT("long"),
    },
    {
      sequelize,
      modelName: "Video",
    }
  );

  const Lesson = sequelize.define("Lesson");
  Video.belongsTo(Lesson, { foreignKey: "id", as: "video" });

  return Video;
};
