'use strict';

const { sequelize } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Chats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // members: {
      //   type: Sequelize.ARRAY(Sequelize.INTEGER),
      // }
      firstId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id"
        },
      },
      secondId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id"
        },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Chats');
  }
};