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

/**
 * @swagger
 * /api/v2/courses/getByLimit:
 *   get:
 *     summary: Get courses by pagination
 *     parameters:
 *      - name: language
 *        in: query
 *        description: Language
 *        required: true
 *        schema:
 *          type: string
 *          example: en
 *      - name: page
 *        in: query
 *        description: Page number
 *        required: true
 *        schema:
 *          type: integer
 *          example: 1
 *      - name: limit
 *        in: query
 *        description: Number of items per page
 *        required: true
 *        schema:
 *          type: integer
 *          example: 10
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: No valid data
 */

/**
 * @swagger
 * /api/v2/courses/getByFilter:
 *   get:
 *     summary: Get courses by filter
 *     parameters:
 *      - name: language
 *        in: query
 *        description: Language
 *        required: true
 *        schema:
 *          type: string
 *          example: en
 *      - name: level
 *        in: query
 *        description: Level
 *        required: true
 *        schema:
 *          type: string
 *          example: Beginner
 *      - name: format
 *        in: query
 *        description: Format
 *        required: true
 *        schema:
 *          type: string
 *          example: Online
 *      - name: maxPrice
 *        in: query
 *        description: max Price
 *        required: false
 *        schema:
 *          type: integer
 *          example: 75
 *      - name: minPrice
 *        in: query
 *        description: min Price
 *        required: false
 *        schema:
 *          type: integer
 *          example: 10
 *      - name: isDiscount
 *        in: query
 *        description: is Discount
 *        required: false
 *        schema:
 *          type: boolean
 *          example: false
 *     responses:
 *       200:
 *         description: Object
 *       403:
 *         description: No valid data
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Login:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: test1234
 */


/**
 * @swagger
 * /api/v2/user/login:
 *   post:
 *     summary: Login User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: success true
 *       403:
 *         description: Invaunvlid email or password!.
 */

/**
 * @swagger
 * /api/v2/user/ForgotPassword:
 *   get:
 *     summary: send mail for reset password
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
 *         description: There is not verified user!
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     ResetPassword:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *           format: email
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV...
 *         newPassword:
 *           type: string
 *           example: test1234
 */

/**
 * @swagger
 * /api/v2/user/ChangePassword:
 *   patch:
 *     summary: Reset Password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: success:true
 *       403:
 *         description: token timeout!
 *       404:
 *         description: User not Found!
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     ResetEmail:
 *       type: object
 *       required:
 *         - email
 *         - newEmail
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: test@example.com
 *         newEmail:
 *           type: string
 *           example: newEmail@example.com
 */

/**
 * @swagger
 * /api/v2/user/ChangeEmail:
 *   patch:
 *     summary: Reset Email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetEmail'
 *     responses:
 *       200:
 *         description: success:true
 *       403:
 *         description: Invalid Email format
 *       404:
 *         description: User not found!
*/


const swaggerSpec = swaggerJSDOC(options);
module.exports = {
  swaggerSpec,
};
