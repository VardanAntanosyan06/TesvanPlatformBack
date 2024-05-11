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
      ChatMessages.hasMany(models.ChatMessages, { foreignKey: "isReply", as: "ParentMessage" })
      ChatMessages.belongsTo(models.ChatMessages, { foreignKey: "isReply", as: "Reply" })
    }
  }
  ChatMessages.init({
    chatId: DataTypes.INTEGER,
    senderId: DataTypes.INTEGER,
    text: DataTypes.TEXT,
    image: DataTypes.STRING,
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