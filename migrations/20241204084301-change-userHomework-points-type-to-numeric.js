'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('UserHomeworks', 'points', {
      type: Sequelize.NUMERIC,
      defaultValue: 0,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('UserHomeworks', 'points', {
      type: Sequelize.INTEGER,
    });
  }
};
