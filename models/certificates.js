'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Certificates extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Certificates.init({
    userId: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    giveDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Certificates',
  });

  const Users = sequelize.define("Users")
  Certificates.belongsTo(Users,{foreignKey:"userId"})
  return Certificates;
};