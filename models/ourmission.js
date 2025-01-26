'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OurMission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OurMission.init({
    mission_en: DataTypes.TEXT,
    mission_am: DataTypes.TEXT,
    mission_ru: DataTypes.TEXT,
    quality_en: DataTypes.STRING,
    quality_am: DataTypes.STRING,
    quality_ru: DataTypes.STRING,
    efficiency_en: DataTypes.STRING,
    efficiency_am: DataTypes.STRING,
    efficiency_ru: DataTypes.STRING,
    community_en: DataTypes.STRING,
    community_am: DataTypes.STRING,
    community_ru: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'OurMission',
  });
  return OurMission;
};