'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class continuingGroups extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      continuingGroups.belongsTo(models.Groups, { foreignKey: "groupId", as: "continuingGroup", onDelete: 'CASCADE' })
    }
  }
  continuingGroups.init({
    groupId: DataTypes.INTEGER,
    lastGroupId: DataTypes.INTEGER,
    lessnIds: DataTypes.ARRAY(DataTypes.INTEGER)
  }, {
    sequelize,
    modelName: 'continuingGroups',
  });
  return continuingGroups;
};