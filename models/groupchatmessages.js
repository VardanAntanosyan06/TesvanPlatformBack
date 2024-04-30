'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupChatMessages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GroupChatMessages.belongsTo(models.Users, {foreignKey: "senderId"})
    }
  }
  GroupChatMessages.init({
    groupChatId: DataTypes.INTEGER,
    senderId: DataTypes.INTEGER,
    text: DataTypes.TEXT,
    isUpdated: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'GroupChatMessages',
  });
  return GroupChatMessages;
};