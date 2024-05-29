'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Presentations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Presentations.init(
    {
      title_en: DataTypes.TEXT('long'),
      title_ru: DataTypes.TEXT('long'),
      title_am: DataTypes.TEXT('long'),
      url_en: DataTypes.TEXT('long'),
      url_ru: DataTypes.TEXT('long'),
      url_am: DataTypes.TEXT('long'),
      description_en: DataTypes.TEXT('long'),
      description_ru: DataTypes.TEXT('long'),
      description_am: DataTypes.TEXT('long'),
      lessonId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Presentations',
    },
  );

  const Lesson = sequelize.define('Lesson');
  Presentations.belongsTo(Lesson, {
    foreignKey: 'id',
  });
  return Presentations;
};
