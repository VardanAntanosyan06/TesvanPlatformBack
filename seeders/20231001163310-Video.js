"use strict";
const { Videos } = require("../utils/Videos");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Videos", Videos);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Videos", null, {});
  },
};
