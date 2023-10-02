"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Lessons", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      courseId: Sequelize.INTEGER,
      title_en: { type: Sequelize.STRING },
      description_en: { type: Sequelize.TEXT("long") },
      title_ru: { type: Sequelize.STRING },
      description_ru: { type: Sequelize.TEXT("long") },
      title_am: { type: Sequelize.STRING },
      description_am: { type: Sequelize.TEXT("long") },
      number: {
        type: Sequelize.INTEGER,
      },
      maxPoints: {
        type: Sequelize.INTEGER,
      },
      language: {
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
    await queryInterface.dropTable("Lessons");
  },
};
