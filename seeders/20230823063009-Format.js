'use strict';
const {Format} = require("../utils/Format")

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Formats',Format)
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Formats', null, {});
  }
};