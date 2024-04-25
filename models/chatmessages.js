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
    }
  }
  ChatMessages.init({
    chatId: DataTypes.INTEGER,
    senderId: DataTypes.INTEGER,
    text: DataTypes.TEXT,
    isUpdated: {
      type:DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'ChatMessages',
  });

  return ChatMessages;
};