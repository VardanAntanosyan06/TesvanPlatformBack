'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Testimonials', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fullName_en: {
        type: Sequelize.STRING
      },
      fullName_am: {
        type: Sequelize.STRING
      },
      fullName_ru: {
        type: Sequelize.STRING
      },
      staff: {
        type: Sequelize.STRING
      },
      testimonial_en: {
        type: Sequelize.TEXT
      },
      testimonial_am: {
        type: Sequelize.TEXT
      },
      testimonial_ru: {
        type: Sequelize.TEXT
      },
      img: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Testimonials');
  }
};