'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Calendar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Calendar.init(
    {
      title: DataTypes.STRING,
      start: DataTypes.DATE,
      end: DataTypes.DATE,
      description: DataTypes.STRING,
      format: DataTypes.STRING,
      link: DataTypes.STRING,
      type: DataTypes.STRING,
      userId: DataTypes.ARRAY(DataTypes.STRING),
      groupId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Calendar',
    },
  );
  return Calendar;
};
