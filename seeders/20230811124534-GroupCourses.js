'use strict';
const {GroupCourses} = require("../utils/GroupCourses")

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('GroupCourses',GroupCourses)
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('GroupCourses', null, {});
  }
};