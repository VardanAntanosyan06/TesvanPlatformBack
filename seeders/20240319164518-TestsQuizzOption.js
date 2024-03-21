'use strict';
const { TestsQuizzOption } = require('../utils/Test');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('TestsQuizzOptions', TestsQuizzOption);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('TestsQuizzOptions', null, {});
  },
};
