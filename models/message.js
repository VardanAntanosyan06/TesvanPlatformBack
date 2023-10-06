"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Message.init(
    {
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      title_en: DataTypes.STRING,
      description_en: DataTypes.STRING,
      title_ru: DataTypes.STRING,
      description_ru: DataTypes.STRING,
      title_am: DataTypes.STRING,
      description_am: DataTypes.STRING,
      isNew: DataTypes.BOOLEAN,
      type: {
        type: DataTypes.STRING,
        isIn: {
          args: [["info", "success", "warning", "critical"]],
          msg: "Type must be info, success, warning, or critical",
        },
      },
    },
    {
      sequelize,
      modelName: "Message",
    }
  );

  const User = sequelize.define("User");
  Message.belongsTo(User);

  return Message;
};
