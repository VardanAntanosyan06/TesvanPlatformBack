'use strict';
const { Model } = require('sequelize');
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
  UserTests.init(
    {
      userId: DataTypes.INTEGER,
      testId: DataTypes.INTEGER,
      courseId: DataTypes.INTEGER,
      language: DataTypes.STRING,
      status: DataTypes.STRING,
      passDate: DataTypes.DATE,
      point: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'UserTests',
    },
  );

  const Tests = sequelize.define('Tests');
  const Users = sequelize.define('Users');

  UserTests.belongsTo(Tests, { foreignKey: 'testId' });
  UserTests.belongsTo(Users, { foreignKey: 'userId' });

  return UserTests;
};
