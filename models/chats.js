'use strict';
const {
  Model,
  ForeignKeyConstraintError
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chats extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        Chats.belongsTo(models.Users, {foreignKey: "firstId", as: "firstIds"})
        Chats.belongsTo(models.Users, {foreignKey: "secondId", as: "secondIds"})
        Chats.hasMany(models.ChatMessages, {foreignKey: "chatId", onDelete: 'CASCADE' })
    }
  }
  Chats.init({
    firstId: {
      type: DataTypes.INTEGER
    },
    secondId: {
      type: DataTypes.INTEGER
    },
  },
    {
      sequelize,
      modelName: 'Chats',
      timestamps: false
    });
  return Chats;
};