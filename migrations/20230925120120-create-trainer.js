"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Trainers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fullName: {
        type: Sequelize.STRING,
      },
      img: {
        type: Sequelize.STRING,
      },
      profession: {
        type: Sequelize.STRING,
      },
      courseId:{
        type:Sequelize.INTEGER
      },
      type:{
        type:Sequelize.STRING
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
    await queryInterface.dropTable("Trainers");
  },
};
