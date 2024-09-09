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

async function toLoverCase() {
    const users = await Users.findAll(
    )
    users.forEach(user => {
        console.log(user.email);
        
        user.email = user.email.toLowerCase()
        user.save()
    });
}
toLoverCase()
