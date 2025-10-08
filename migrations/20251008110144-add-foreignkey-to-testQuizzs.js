'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('TestsQuizzs', {
      fields: ['testId'], // your existing column name
      type: 'foreign key',
      name: 'fk_tests_quizz_testId', // custom name for the constraint
      references: {
        table: 'Tests', // target table name
        field: 'id',    // target column
      },
      onDelete: 'CASCADE',  // or 'SET NULL', 'RESTRICT'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('TestsQuizzs', 'fk_tests_quizz_testId');
  }
};
