'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FAQs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      question_en: {
        type: Sequelize.STRING
      },
      question_am: {
        type: Sequelize.STRING
      },
      question_ru: {
        type: Sequelize.STRING
      },
      answer_en: {
        type: Sequelize.TEXT
      },
      answer_am: {
        type: Sequelize.TEXT
      },
      answer_ru: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('FAQs');
  }
};