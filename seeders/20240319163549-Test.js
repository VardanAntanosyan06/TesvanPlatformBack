"use strict";
const { Tests } = require("../utils/Test");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Tests", Tests);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Tests", null, {});
  },
};
