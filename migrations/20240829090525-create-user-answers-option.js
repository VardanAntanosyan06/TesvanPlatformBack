'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserAnswersOptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userAnswerQuizzId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'UserAnswersQuizzs',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      title_en: {
        type: Sequelize.STRING
      },
      title_am: {
        type: Sequelize.STRING
      },
      title_ru: {
        type: Sequelize.STRING
      },
      isCorrect: {
        type: Sequelize.BOOLEAN
      },
      userAnswer: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserAnswersOptions');
  }
};