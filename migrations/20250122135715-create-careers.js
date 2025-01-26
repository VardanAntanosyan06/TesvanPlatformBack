'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Careers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title_en: {
        type: Sequelize.STRING
      },
      description_en: {
        type: Sequelize.TEXT
      },
      title_am: {
        type: Sequelize.STRING
      },
      description_am: {
        type: Sequelize.TEXT
      },
      title_ru: {
        type: Sequelize.STRING
      },
      description_ru: {
        type: Sequelize.TEXT
      },
      term: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      location: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Careers');
  }
};