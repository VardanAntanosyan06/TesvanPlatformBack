"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Homework", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      courseId: Sequelize.INTEGER,
      title_en: {
        type: Sequelize.STRING,
      },
      description_en: {
        type: Sequelize.TEXT("long"),
      },
      title_ru: {
        type: Sequelize.STRING,
      },
      description_ru: {
        type: Sequelize.TEXT("long"),
      },
      title_am: {
        type: Sequelize.STRING,
      },
      description_am: {
        type: Sequelize.TEXT("long"),
      },
      maxPoints: {
        type: Sequelize.INTEGER,
      },
      isOpen: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable("Homework");
  },
};
