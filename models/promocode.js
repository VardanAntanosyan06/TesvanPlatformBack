'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PromoCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PromoCode.belongsTo(models.Groups, { foreignKey: "groupId" })
    }
  }
  PromoCode.init({
    groupId: DataTypes.INTEGER,
    code: DataTypes.STRING,
    count: DataTypes.INTEGER,
    userCount: DataTypes.INTEGER,
    endDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PromoCode',
  });
  return PromoCode;
};