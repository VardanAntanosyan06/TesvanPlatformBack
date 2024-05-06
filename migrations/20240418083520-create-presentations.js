"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Presentations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title_en: {
        type: Sequelize.STRING,
      },
      title_ru: {
        type: Sequelize.STRING,
      },
      title_am: {
        type: Sequelize.STRING,
      },
      url_en: {
        type: Sequelize.STRING,
      },
      url_ru: {
        type: Sequelize.STRING,
      },
      url_am: {
        type: Sequelize.STRING,
      },
      description_en: {
        type: Sequelize.STRING,
      },
      description_ru: {
        type: Sequelize.STRING,
      },
      description_am: {
        type: Sequelize.STRING,
      },
      lessonId: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("Presentations");
  },
};
