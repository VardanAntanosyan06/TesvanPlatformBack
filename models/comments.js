'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Comments.init({
    fullName_en: DataTypes.STRING,
    role_en: DataTypes.STRING,
    comment_en: DataTypes.TEXT("long"),
    fullName_ru: DataTypes.STRING,
    role_ru: DataTypes.STRING,
    comment_ru: DataTypes.TEXT("long"),
    fullName_am: DataTypes.STRING,
    role_am: DataTypes.STRING,
    comment_am: DataTypes.TEXT("long"),
    img: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Comments',
    timestamps:false
  });
  return Comments;
};