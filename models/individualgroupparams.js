'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class IndividualGroupParams extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  IndividualGroupParams.init({
    userId: DataTypes.INTEGER,
    groupId: DataTypes.INTEGER,
    courseId: DataTypes.INTEGER,
    lessonCount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'IndividualGroupParams',
  });
  return IndividualGroupParams;
};