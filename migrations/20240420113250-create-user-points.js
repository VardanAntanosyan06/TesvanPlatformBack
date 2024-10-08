'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserPoints', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      quizzId: {
        type:Sequelize.INTEGER
      },
      point:{
        type:Sequelize.DECIMAL
      },
      correctAnswers:{
        type:Sequelize.INTEGER
      },
      isFinal:{
        type:Sequelize.BOOLEAN
      },
      courseId:{
        type:Sequelize.INTEGER
      }, 
      lessonId:{
        type:Sequelize.INTEGER
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
    await queryInterface.dropTable('UserPoints');
  }
};