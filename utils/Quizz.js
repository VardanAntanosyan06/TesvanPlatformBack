const Quizzes = [
  {
    
    title_en: "Lorem ipsum",
    description_en: "Lorem ipsum",
    title_ru: "Lorem ipsum",
    description_ru: "Lorem ipsum",
    title_am: "Lorem ipsum",
    description_am: "Lorem ipsum",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const Questions = [
  {
    quizzId: 1,
    title: "1 Question",
    points: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    quizzId: 1,
    title: "2 Question",
    points: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    quizzId: 1,
    title: "3 Question",
    points: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    quizzId: 1,
    title: "4 Question",
    points: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const Options = [
  {
    questionId: 1,
    title: "1 Option incorrect",
    isCorrect: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    questionId: 1,
    title: "2 Option incorrect",
    isCorrect: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    questionId: 1,
    title: "3 Option correct",
    isCorrect: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    questionId: 1,
    title: "4 Option incorrect",
    isCorrect: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

module.exports = {
  Quizzes,
  Questions,
  Options,
};
