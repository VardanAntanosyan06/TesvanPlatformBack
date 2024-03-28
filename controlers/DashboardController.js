const { Users, Groups, GroupsPerUsers } = require("../models");

const getUserStatictis = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;

    const { lessons, homeWork, quizzes } = await GroupsPerUsers.findOne({
      where: {
        userId,
        groupId: id,
      },
    });

    const response = {
      lessons,
      homeWork,
      quizzes,
      totalPoints: (lessons + homeWork + quizzes) / 3,
      mySkils: [
        {
          name: "Communication",
          point: 10,
        },
        {
          name: "Test case execution",
          pont: 80,
        },
        {
          name: "Agile methodology",
          point: 100,
        },
        {
          name: "Scrum methodology",
          point: 100,
        },
        {
          name: "Cypress",
          point: 10,
        },
      ],
      course: {
        students: "21 stuundet",
        lessons: "30 lessons",
        course: "1 course",
      },
      daily: {
        quizz: [
          {
            id: 1,
            title: "Lorem ipsum",
            description: "Lorem ipsum",
          },
        ],
        homework: [
          {
            id: 1,
            title: "test",
            description: "test",
          },
        ],
      },
    };
    return res.json(response);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something Went Wrong" });
  }
};

module.exports = {
  getUserStatictis,
};
