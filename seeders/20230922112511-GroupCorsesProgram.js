'use strict';
const {GroupCorsesProgram} = require("../utils/GroupCourses")

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('CoursePrograms',GroupCorsesProgram)
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('CoursePrograms', null, {});
  }
};