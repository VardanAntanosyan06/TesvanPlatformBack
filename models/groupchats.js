'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupChats extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GroupChats.hasMany(models.GroupChatMessages, {as: 'messages', foreignKey: 'groupChatId', onDelete: 'CASCADE'});
      GroupChats.hasOne(models.GroupChatMessages, { foreignKey: "groupChatId", as: "isReads", })
      GroupChats.hasOne(models.GroupChatReads, {foreignKey: "groupChatId", as: "userLastSeen"})
    }
  }
  GroupChats.init({
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    groupId: DataTypes.INTEGER,
    adminId: DataTypes.INTEGER,
    members: DataTypes.ARRAY(DataTypes.INTEGER)
  }, {
    sequelize,
    modelName: 'GroupChats',
    timestamps: false
  });
  return GroupChats;
};