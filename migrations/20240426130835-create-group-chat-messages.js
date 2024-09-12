'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GroupChatMessages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      groupChatId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'GroupChats',
          key: 'id'
        },
        onDelete: 'CASCADE',
      },
      senderId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      text: {
        type: Sequelize.TEXT
      },
      image: {
        type: Sequelize.STRING
      },
      file: {
        type: Sequelize.STRING
      },
      isUpdated: {
        type: Sequelize.BOOLEAN
      },
      isReply: {
        type: Sequelize.INTEGER,
        references: {
          model: 'GroupChatMessages',
          key: "id"
        },
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('GroupChatMessages');
  }
};