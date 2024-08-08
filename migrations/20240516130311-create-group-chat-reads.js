'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GroupChatReads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id"
        }
      },
      groupChatId: {
        type: Sequelize.INTEGER,
        references: {
          model: "GroupChats",
          key: "id"
        }
      },
      lastSeen: {
        type: Sequelize.INTEGER
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GroupChatReads');
  }
};