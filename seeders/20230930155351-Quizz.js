"use strict";
const { Quizzes } = require("../utils/Quizz");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Quizzs", Quizzes);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Quizzs", null, {});
  },
};
