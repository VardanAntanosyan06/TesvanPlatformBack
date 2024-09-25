const { where } = require('sequelize')
const { UserHomework, Quizz, Question, Option, UserAnswersQuizz, UserAnswersOption, CoursesContents, Users } = require('./models')
const { log } = require('console')
const users = [3, 163, 754, 900, 907, 890, 879]
const lessons = [1, 2, 4, 5, 3, 6, 7, 8, 18, 19]
// async function add() {
//     await Promise.all(
//         lessons.map(async (id) => {
//             await UserHomework.create({
//                 GroupCourseId: 12,
//                 UserId: 900,
//                 HomeworkId: 0,
//                 LessonId: id
//             })
//         })
//     )
// }
// add()

// async function question(params) {




// question()


// async function userAnswer(params) {

//   // const question = await 
//     const userAnswersQuizz = await UserAnswersQuizz.findAll({
//         where: {
//           testId: 56, //poxvi lessonId
//           userId: 754,
//           courseId: 12,
//         },
//         include: [
//           {
//             model: UserAnswersOption,
//             as: 'userAnswersOption'
//           }
//         ],
//         atri
//       })

//       log(userAnswersQuizz[0].userAnswersOption[0].toJSON())
// }
// userAnswer()


// async function addAnswerData(params) {

//   const userAnsvers = await UserAnswersQuizz.findAll({
//     order: [['id', 'ASC']],
//   })
//   userAnsvers.forEach(async (userAnsver) => {
//     const question = await Question.findOne({
//       where: {
//         id: userAnsver.questionId
//       },
//       include: [
//         {
//           model: Option,
//         }
//       ],
//     })
//     question?.Options.forEach(async(option)=> {
//       await UserAnswersOption.create({
//         userAnswerQuizzId: userAnsver.id,
//         title_en: option.title_en,
//         title_am: option.title_am,
//         title_ru: option.title_ru,
//         isCorrect: option.isCorrect,
//         userAnswer: userAnsver.optionId === option.id? true: false
//       })
//     })
//     // if (question) {
//     //   await UserAnswersQuizz.update(
//     //     {
//     //       lessonsId: 0,
//     //       questionTitle_en: question.title_en,
//     //       questionTitle_am: question.title_am,
//     //       questionTitle_ru: question.title_ru
//     //     },
//     //     {
//     //       where: {
//     //         questionId: question.id,
//     //       }
//     //     }
//     //   )
//     // }

//   });
// }

// addAnswerData()


// async function coureContent(params) {
//     const maxPoint = await CoursesContents.findOne({
//         where: {
//           courseId: 12
//         }
//       })
//       console.log(maxPoint.maxQuizzPoint, maxPoint.maxInterviewPoint, maxPoint.maxHomeworkPoint);
// }

// coureContent()

// async function toLoverCase() {
//     const users = await Users.findAll(
//     )
//     users.forEach(user => {
//         console.log(user.email);

//         user.email = user.email.toLowerCase()
//         user.save()
//     });
// }
// toLoverCase()

// const axios = require('axios');


// async function fuu(){

// const { data: paymentResponse } = await axios.post(
//     `http://localhost:4000/api/v2/quizz/submitQuizz?courseId=17&lessonId=22&language=am`,
//     {"quizzId":92,"questionId":2515,"optionId":9545}
//   )
// }

// fuu()

// const pdf = require('html-pdf');
// const fs = require('fs');
// const path = require('path');

// const htmlFilePath = path.join(__dirname, 'certificate.html'); // Path to HTML file
// const cssFilePath = path.join(__dirname, 'styles.css');
// const jsFilePath = path.join(__dirname, 'script.js'); // Path to CSS file

// function createPDF() {

//     fs.readFile(cssFilePath, 'utf-8', (err, cssData) => {
//         if (err) {
//             console.error('Error reading CSS file:', err);
//             return;
//         }
//         const htmlWithStyles = `
//                 <html>
//                 <head>
//                     <style>${cssData}</style>
//                 </head>
//                 <body>
//                 <div class="certificate-container">
//                         <div class="certificate-content">
//                             <h1 class="certificate-title">CERTIFICATE</h1>
//                             <p class="certificate-subtitle">OF PARTICIPATION</p>

//                             <p class="presented-to">This certificate is proudly presented to</p>
//                             <h2 class="name">Sarah Smith</h2>
//                             <p class="confirmation">This certificate confirms that he/she has participated in the Manual Testing course</p>

//                             <div class="date-signature">
//                                 <div class="date">
//                                     <p class="label">Date</p>
//                                     <p id="date">25</p>
//                                 </div>
//                                 <div class="signature">
//                                     <p class="label">Signature</p>
//                                     <img src="signature.png" alt="Signature" class="signature-img">
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <script>
//                     </script>
//                 </body>
//                 </html>
//             `;

//         const options = { format: 'A4' };
//         const outputFilePath = path.join(__dirname, 'output.pdf'); 

//         pdf.create(htmlWithStyles, options).toFile(outputFilePath, (err, res) => {
//             if (err) {
//                 console.error('Error creating PDF:', err);
//                 return;
//             }
//             console.log('PDF successfully created:', res.filename);
//         });

//     });

// }

// // Call the function to create the PDF
// createPDF();