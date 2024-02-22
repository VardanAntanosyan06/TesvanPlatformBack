'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserTests extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserTests.init({
    userId: DataTypes.INTEGER,
    testId: DataTypes.INTEGER,
    status: DataTypes.STRING,
    passDate: DataTypes.DATE,
    point: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserTests',
  });

  const Tests = sequelize.define("Tests")

  UserTests.belongsTo(Tests,{foreignKey:'testId'})
  return UserTests;
};