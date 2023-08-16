const swaggerJSDOC = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tesvan Platform",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://165.232.74.168/",
      },
    ],
  },
  apis: ["controlers/swaggeracontroller.js"],
};

/**
 * @swagger
 * /api/v2/courses/getAll:
 *   get:
 *     summary: get all Courses
 *     parameters:
 *      - name: language
 *        in: query
 *        description: language (am, ru or en)
 *        required: true
 *        schema:
 *          type: string
 *          example: am
 *     responses:
 *       200:
 *         description: The Object
 *       403:
 *         description: The language must be am, ru, or en
*/

/**
 * @swagger
 * /api/v2/comments/getAll:
 *   get:
 *     summary: get all Comments
 *     responses:
 *       200:
 *         description: The Object
 *       500:
 *         description: Server error
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phoneNumber
 *         - birthday
 *         - gender
 *         - country
 *         - city
 *         - englishLevel
 *         - education
 *         - backgroundInQA
 *         - password
 *         - role
 *       properties:
 *         firstName:
 *           type: string
 *           example: user
 *         lastName:
 *           type: string
 *           example: user's lastname
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         phoneNumber:
 *           type: string
 *           example: +37499999999
 *         birthday:
 *           type: string
 *           format: date-time
 *           example: 2023-08-14T11:51:33.897Z
 *         gender:
 *           type: string
 *           example: Male
 *         country:
 *           type: string
 *           example: Armenia
 *         city:
 *           type: string
 *           example: Yerevan
 *         englishLevel:
 *           type: string
 *           example: B1
 *         education:
 *           type: string
 *           example: some info
 *         backgroundInQA:
 *           type: boolean
 *           example: false
 *         password:
 *           type: string
 *           example: test1234
 *         role:
 *           type: string
 *           example: Student
 */

/**
 * @swagger
 * /api/v2/register/:
 *   post:
 *     summary: Registartion User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: success true
 *       403:
 *         description: Some Validation error.
 */

/**
 * @swagger
 * /api/v2/register/sendEmail:
 *   get:
 *     summary: send mail for user's verification
 *     parameters:
 *      - name: email
 *        in: query
 *        description: email of user
 *        required: true
 *        schema:
 *          type: string
 *          example: user@example.com
 *     responses:
 *       200:
 *         description: success:true
 *       404:
 *         description: There is not unverified user!
*/

/**
 * @swagger
 * /api/v2/register/verification:
 *   patch:
 *     summary: Verified User from token (sent in mail)
 *     parameters:
 *      - name: token
 *        in: query
 *        description: token of user
 *        required: true
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV...
 *     responses:
 *       200:
 *         description: success:true
 *       403:
 *         description: token timeout!
*/

const swaggerSpec = swaggerJSDOC(options);
module.exports = {
  swaggerSpec,
};
