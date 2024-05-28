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
      GroupChatReads.belongsTo(models.Users, {foreignKey: "userId"}),
      GroupChatReads.belongsTo(models.GroupChats, { as: 'groupChat', foreignKey: 'groupChatId' });
    }
  }
  GroupChatReads.init({
    userId: DataTypes.INTEGER,
    groupChatId: DataTypes.INTEGER,
    lastSeen: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GroupChatReads',
    timestamps: false
  });
  return GroupChatReads;
};