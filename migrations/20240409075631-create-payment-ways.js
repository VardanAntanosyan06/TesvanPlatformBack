'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PaymentWays', {
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
        type: Sequelize.STRING,
      },
      description_ru: {
        type: Sequelize.STRING,
      },
      description_am: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.DECIMAL,
      },
      discount: {
        type: Sequelize.FLOAT,
      },
      groupId: {
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
      durationMonths:{
        type: Sequelize.INTEGER
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PaymentWays');
  },
};
