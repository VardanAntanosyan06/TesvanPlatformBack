'use strict';
const { TestsQuizz } = require('../utils/Test');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('TestsQuizzs', TestsQuizz);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('TestsQuizzs', null, {});
  },
};
