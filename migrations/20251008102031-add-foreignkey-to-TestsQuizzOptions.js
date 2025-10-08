'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('TestsQuizzOptions', {
      fields: ['questionId'], // your existing column name
      type: 'foreign key',
      name: 'fk_tests_quizz_options_a', // custom name for the constraint
      references: {
        table: 'TestsQuizzs', // target table name
        field: 'id',    // target column
      },
      onDelete: 'CASCADE',  // or 'SET NULL', 'RESTRICT'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('TestsQuizzOptions', 'fk_tests_quizz_options_a');
  }
};
