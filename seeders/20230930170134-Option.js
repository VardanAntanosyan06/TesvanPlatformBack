"use strict";
const { Options } = require("../utils/Quizz");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Options", Options);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Options", null, {});
  },
};
