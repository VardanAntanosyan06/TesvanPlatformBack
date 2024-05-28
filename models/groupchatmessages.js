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
      GroupChatMessages.belongsTo(models.GroupChats, {foreignKey: 'groupChatId', as: 'groupChat', onDelete: 'CASCADE'});
      GroupChatMessages.belongsTo(models.Users, {foreignKey: "senderId"})
      GroupChatMessages.hasMany(models.GroupChatMessages, { foreignKey: "isReply", as: "ParentMessage" })
      GroupChatMessages.belongsTo(models.GroupChatMessages, { foreignKey: "isReply", as: "Reply" })
      GroupChatMessages.belongsTo(models.GroupChats, {foreignKey: "groupChatId", as: "isReads"})
    }
  }
  GroupChatMessages.init({
    groupChatId: DataTypes.INTEGER,
    senderId: DataTypes.INTEGER,
    text: DataTypes.TEXT,
    image: DataTypes.STRING,
    file: DataTypes.STRING,
    isUpdated: DataTypes.BOOLEAN,
    isReply: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GroupChatMessages',
  });
  return GroupChatMessages;
};