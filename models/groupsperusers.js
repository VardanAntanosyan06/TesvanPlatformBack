"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GroupsPerUsers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GroupsPerUsers.init(
    {
      groupId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      personalSkils: DataTypes.ARRAY(DataTypes.STRING),
      professionalSkils: DataTypes.ARRAY(DataTypes.STRING),
      certification: DataTypes.STRING,
      lessons: DataTypes.INTEGER,
      homeWork: DataTypes.INTEGER,
      quizzes: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "GroupsPerUsers",
    }
  );

  const Users = sequelize.define("Users");

  GroupsPerUsers.belongsTo(Users, { foreignKey: "userId" });

  return GroupsPerUsers;
};
