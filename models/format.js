'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Format extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Format.init({
    slug: DataTypes.STRING,
    am: DataTypes.STRING,
    ru: DataTypes.STRING,
    en: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Format',
    timestamps:false
  });
  return Format;
};