'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupChatReads extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GroupChatReads.belongsTo(models.Users, { foreignKey: 'userId' })
      GroupChatReads.belongsTo(models.GroupChatMessages, { foreignKey: 'messageId' })
    }
  }
  GroupChatReads.init({
    userId: DataTypes.INTEGER,
    messageId: DataTypes.INTEGER,
    lastSeen: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GroupChatReads',
  });
  return GroupChatReads;
};