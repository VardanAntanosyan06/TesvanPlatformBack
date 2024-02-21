'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type:Sequelize.STRING
      },
      description:{
        type:Sequelize.STRING
      },
      courseId: {
        type:Sequelize.INTEGER
      },
      language:{
        type:Sequelize.STRING
      },
      type:{
        type:Sequelize.STRING
      },
      time:{
        type:Sequelize.INTEGER
      },
      percent: {
        type: Sequelize.INTEGER,
        defaultValue:0,
        
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
    await queryInterface.dropTable('Tests');
  }
};