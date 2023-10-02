"use strict";
const { Lessons } = require("../utils/Lessons");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Lessons", Lessons);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Lessons", null, {});
  },
};
