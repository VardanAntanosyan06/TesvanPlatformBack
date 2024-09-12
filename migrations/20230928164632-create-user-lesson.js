"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserLessons", {
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
      LessonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Lessons",
          key: "id",
        },
      },
      points: {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      attempt: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      homeworkPoint: {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      quizzPoint: {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
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
    await queryInterface.dropTable("UserLessons");
  },
};
