'use strict';
const {CourseType} = require("../utils/CourseType")

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('CourseTypes',CourseType)
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('CourseTypes', null, {});
  }
};