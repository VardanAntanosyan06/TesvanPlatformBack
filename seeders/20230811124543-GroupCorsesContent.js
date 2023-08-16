'use strict';
const {GroupCorsesContent} = require("../utils/GroupCourses")

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('CoursesContents',GroupCorsesContent)
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('CoursesContents', null, {});
  }
};