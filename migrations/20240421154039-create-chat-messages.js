'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChatMessages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      chatId: {
        type: Sequelize.INTEGER,
      },
      senderId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      text: {
        type: Sequelize.TEXT,
      },
      image: {
        type: Sequelize.STRING,
      },
      isUpdated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isReply: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ChatMessages',
          key: 'id',
        },
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
    await queryInterface.dropTable('ChatMessages');
  },
};
