'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Email extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Email.init(
    {
      userId: DataTypes.INTEGER,
      newEmail: DataTypes.STRING,
      newEmailVerification: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Email',
    },
  );

  return Email;
};
