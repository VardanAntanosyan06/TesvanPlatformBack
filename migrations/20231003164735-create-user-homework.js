"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserHomeworks", {
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
      HomeworkId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Homework",
          key: "id",
        },
      },
      points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      answer: {
        type: Sequelize.TEXT("long"),
        defaultValue: "",
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
    await queryInterface.dropTable("UserHomeworks");
  },
};
