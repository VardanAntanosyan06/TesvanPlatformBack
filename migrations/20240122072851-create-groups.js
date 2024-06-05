"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Groups", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name_am: {
        type: Sequelize.STRING,
      },
      name_ru: {
        type: Sequelize.STRING,
      },
            name_en: {
        type: Sequelize.STRING,
      },
      assignCourseId: {
        type: Sequelize.INTEGER,
      },
      groupeKey: {
        type: Sequelize.STRING,
      },
      finished: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      startDate: {
        type: Sequelize.DATE,
      },
      endDate: {
        type: Sequelize.DATE,
      },
      price: {
        type: Sequelize.INTEGER,
      },
      sale: {
        type: Sequelize.FLOAT,
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
    await queryInterface.dropTable("Groups");
  },
};
