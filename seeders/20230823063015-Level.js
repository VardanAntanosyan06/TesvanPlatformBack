'use strict';
const {Comments} = require("../utils/Comments")

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Comments',Comments)
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Comments', null, {});
  }
};