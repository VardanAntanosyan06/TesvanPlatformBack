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
    status: {
      type: DataTypes.INTEGER,
      validate: {
        isIn: {
          args: [[1, 2, 3]],
          msg: "status must be '1' or '2','3'",
        },
      },
    },
    url: DataTypes.STRING,
    point: DataTypes.DECIMAL,
    giveDate: DataTypes.DATE,
    courseName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Certificates',
  });

  const Users = sequelize.define("Users")
  Certificates.belongsTo(Users, { foreignKey: "userId" })
  return Certificates;
};