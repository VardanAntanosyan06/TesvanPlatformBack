'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Formats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      slug: {
        type: Sequelize.STRING
      },
      contentAm: {
        type: Sequelize.STRING
      },
      contentRu: {
        type: Sequelize.STRING
      },
      contentEn: {
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Formats');
  }
};