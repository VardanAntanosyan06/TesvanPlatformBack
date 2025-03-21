'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserStatus.belongsTo(models.Users, { foreignKey: "userId", as: "user", onDelete: 'CASCADE' })
    }
  }
  UserStatus.init({
    userId: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN,
    endDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'UserStatus',
  });
  return UserStatus;
};