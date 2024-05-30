"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CoursesContents", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      courseId: {
        type: Sequelize.INTEGER,
      },
      language: {
        type: Sequelize.STRING,
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT("long"),
      },
      courseType: {
        type: Sequelize.STRING,
      },
      lessonType: {
        type: Sequelize.STRING,
      },
      shortDescription: {
        type:Sequelize.STRING
      },

      whyThisCourse: {
        type: Sequelize.ARRAY(Sequelize.TEXT("long")),
      },
      priceTitle: {
        type: Sequelize.STRING
      },
      priceDescription: {
        type: Sequelize.STRING
      },
      duration: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.INTEGER
      },
      discount: {
        type: Sequelize.INTEGER
      },
      level: {
        type: Sequelize.STRING,
      },
      levelDescriptions: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      type:{
        type:Sequelize.STRING
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("CoursesContents");
  },
};
