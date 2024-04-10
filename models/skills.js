'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Skills extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Skills.init(
    {
      type: DataTypes.STRING,
      skill: DataTypes.STRING,
      percent: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Skills',
    },
  );
  const Users = sequelize.define('Users');
  Users.hasMany(Skills, { foreignKey: 'userId' });
  return Skills;
};
