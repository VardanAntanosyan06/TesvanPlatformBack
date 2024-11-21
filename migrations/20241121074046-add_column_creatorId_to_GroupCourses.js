'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('GroupCourses', 'creatorId', {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: 'Users', // Name of the target table
        key: 'id',      // Key in the target table
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('GroupCourses', 'creatorId');
  }
};
