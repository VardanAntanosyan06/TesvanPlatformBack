'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatMessages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ChatMessages.belongsTo(models.Users, { foreignKey: "senderId" })
      ChatMessages.hasMany(models.ChatMessages, { foreignKey: "isReply", as: "ParentMessage", onDelete: 'SET NULL' })
      ChatMessages.belongsTo(models.ChatMessages, { foreignKey: "isReply", as: "Reply" , onDelete: 'SET NULL'})
      ChatMessages.belongsTo(models.Chats, {foreignKey: "chatId", onDelete: 'CASCADE'})
    }
  }
  ChatMessages.init({
    chatId: DataTypes.INTEGER,
    senderId: DataTypes.INTEGER,
    receiverId: DataTypes.INTEGER,
    text: DataTypes.TEXT,
    image: DataTypes.STRING,
    file: DataTypes.STRING,
    isRead: DataTypes.BOOLEAN,
    isUpdated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isReply: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ChatMessages',
  });

  return ChatMessages;
};