'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('UserStatuses', 'endDate', {
      type: Sequelize.DataTypes.DATE,
      defaultValue: Sequelize.literal(`CURRENT_TIMESTAMP - INTERVAL '1 day'`), // Sets default value to one day ago
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserStatuses', 'endDate');
  }
};
