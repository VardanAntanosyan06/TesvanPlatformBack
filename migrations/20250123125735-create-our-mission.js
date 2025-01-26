'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OurMissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      mission_en: {
        type: Sequelize.TEXT
      },
      mission_am: {
        type: Sequelize.TEXT
      },
      mission_ru: {
        type: Sequelize.TEXT
      },
      quality_en: {
        type: Sequelize.STRING
      },
      quality_am: {
        type: Sequelize.STRING
      },
      quality_ru: {
        type: Sequelize.STRING
      },
      efficiency_en: {
        type: Sequelize.STRING
      },
      efficiency_am: {
        type: Sequelize.STRING
      },
      efficiency_ru: {
        type: Sequelize.STRING
      },
      community_en: {
        type: Sequelize.STRING
      },
      community_am: {
        type: Sequelize.STRING
      },
      community_ru: {
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
    await queryInterface.dropTable('OurMissions');
  }
};