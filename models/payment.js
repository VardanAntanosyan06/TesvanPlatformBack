'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Payment.init(
    {
      orderKey: DataTypes.STRING,
      orderNumber: DataTypes.STRING,
      paymentWay: DataTypes.STRING,
      status: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      groupId: DataTypes.INTEGER,
      type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Payment',
    },
  );
  return Payment;
};
