'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fullName_en: {
        type: Sequelize.STRING
      },
      role_en: {
        type: Sequelize.STRING
      },
      comment_en: {
        type: Sequelize.TEXT('long')
      },
      fullName_ru: {
        type: Sequelize.STRING
      },
      role_ru: {
        type: Sequelize.STRING
      },
      comment_ru: {
        type: Sequelize.TEXT('long')
      },
      fullName_am: {
        type: Sequelize.STRING
      },
      role_am: {
        type: Sequelize.STRING
      },
      comment_am: {
        type: Sequelize.TEXT('long')
      },
      img: {
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Comments');
  }
};