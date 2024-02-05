"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserCourses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      GroupCourseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "GroupCourses",
          key: "id",
        },
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      totalPoints: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      takenQuizzes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      personalSkils: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue:[]
      },
      professionalSkils: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue:[]

      },
      certification: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserCourses");
  },
};
