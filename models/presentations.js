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
      title: DataTypes.STRING,
      url: DataTypes.STRING,
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
