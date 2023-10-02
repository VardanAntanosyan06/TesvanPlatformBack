"use strict";
const { Questions } = require("../utils/Quizz");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Questions", Questions);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Questions", null, {});
  },
};
