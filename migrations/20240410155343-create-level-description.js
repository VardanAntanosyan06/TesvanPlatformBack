"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("levelDescriptions", {
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
      description_en: {
        type: Sequelize.TEXT('long'),
      },
      description_ru: {
        type: Sequelize.TEXT('long'),
      },
      description_am: {
        type: Sequelize.TEXT('long'),
      },
      courseId: {
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("levelDescriptions");
  },
};
