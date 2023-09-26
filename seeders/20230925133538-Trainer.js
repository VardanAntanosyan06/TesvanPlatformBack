"use strict";
const { Trainers } = require("../utils/GroupCourses");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Trainers", Trainers);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Trainers", null, {});
  },
};
