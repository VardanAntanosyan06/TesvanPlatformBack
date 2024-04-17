"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class IndividualCourses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  IndividualCourses.init(
    {
      img: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "IndividualCourses",
    }
  );

  // const UserCourses = sequelize.define("UserCourses");
  // IndividualCourses.hasMany(UserCourses, { foreignKey: "GroupCourseId" });

  // const GroupCourses = sequelize.define("GroupCourses");
  // IndividualCourses.belongsTo(GroupCourses);

  const CoursesContents = sequelize.define("CoursesContents");
  IndividualCourses.belongsTo(CoursesContents,{foreignKey:"id"});
  const PaymentWays = sequelize.define("PaymentWays");

  IndividualCourses.hasMany(PaymentWays, {
    foreignKey: "groupId",
    as: "payment",
  });
  const GroupsPerUsers = sequelize.define("GroupsPerUsers");
  const Users = sequelize.define("Users");

  IndividualCourses.hasMany(GroupsPerUsers, {
    foreignKey: "groupId",
  });

  return IndividualCourses;
};
