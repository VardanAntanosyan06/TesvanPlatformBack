'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('CoursesPerQuizzs', 'isOpen', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('CoursesPerQuizzs', 'isOpen');
  }
};
