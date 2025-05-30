'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserCourses', {
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
        onDelete: "CASCADE"
      },
      totalPoints: {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      takenQuizzes: {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      certification: {
        type: Sequelize.STRING,
        defaultValue: 0,
      },
      takenHomework: {
        type: Sequelize.DECIMAL,
      },
      takenInterview: {
        type: Sequelize.DECIMAL,
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
    await queryInterface.dropTable('UserCourses');
  },
};
