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
    }
  }
  Chats.init({
    // members: DataTypes.ARRAY({
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: "Users",
    //     key: "id"
    //   },
    //   // async get() {
    //   //   return await sequelize.models.Users.findAll({
    //   //     where: {
    //   //       id: {in: this.getDataValue("members")}
    //   //     }
    //   //   })
    //   // },
    // }),
    firstId: {
      type: DataTypes.INTEGER
    },
    secondId: {
      type: DataTypes.INTEGER
    },
    // membersData: {
    //   type: DataTypes.VIRTUAL,
    //   async get() {
    //     return await sequelize.models.Users.findAll({
    //       where: {
    //         id: 3
    //       }
    //     })
    //   },
    // },
  },
    {
      sequelize,
      modelName: 'Chats',
      timestamps: false
    });
  return Chats;
};