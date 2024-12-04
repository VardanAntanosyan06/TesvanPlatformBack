'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserHomeworks', {
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
          model: 'GroupCourses',
          key: 'id',
        },
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      startDate: {
        type: Sequelize.DATE,
      },
      feedback: {
        type: Sequelize.TEXT('long'),
      },
      HomeworkId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      LessonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      points: {
        type: Sequelize.INTEGER,
      },
      answer: {
        type: Sequelize.TEXT('long'),
        defaultValue: '',
      },
      status: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('UserHomeworks');
  },
};
