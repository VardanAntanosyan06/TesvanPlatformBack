'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Certificates', 'groupId', {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: 'Groups', // Name of the target table
        key: 'id',      // Key in the target table
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Certificates', 'groupId');
  }
};
