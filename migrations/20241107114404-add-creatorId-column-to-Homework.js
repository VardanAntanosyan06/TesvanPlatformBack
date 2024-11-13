'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Homework', 'creatorId', {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: 'Users', // Name of the target table
        key: 'id',      // Key in the target table
      },
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Homework', 'creatorId');
  }
};
