const { Homework, UserHomework, UserCourses, Message,  GroupCourses, sequelize} = require("../models");
const { userSockets } = require("../userSockets");
const {Op} = require("sequelize");

const create = async (req, res) => {
  try {
    const {
      courseId,
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      maxPoints,
      dueDate
    } = req.body;
    console.log(dueDate,"++++++++++++++++++++++++++");
    let homework = await Homework.create({
      courseId,
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      maxPoints,
      dueDate
    });

    res.send(homework);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const open = async (req, res) => {
  try {
    const { courseId, homeworkId } = req.query;

    let userCourses = await UserCourses.findAll({
      where: { GroupCourseId: courseId },
    });

    let userSocket;
    userCourses.forEach((user) => {
      UserHomework.create({
        UserId: user.UserId,
        GroupCourseId: courseId,
        HomeworkId: homeworkId,
      });
      Message.create({
        UserId: user.UserId,
        title_en: "New Homework",
        title_ru: "New Homework",
        title_am: "New Homework",
        description_en: "You have a new homework!",
        description_ru: "You have a new homework!",
        description_am: "You have a new homework!",
        type: "info",
      });
      userSocket = userSockets.get(user.UserId);
      if (userSocket) {
        userSocket.emit("new-message", "New Message");
      }
    });

    res.send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// mi hat `
const getHomeworks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { language } = req.query;
    const { user_id: userId,role } = req.user;
    let homeworks;
    console.log(userId);
    if(role=="TEACHER"){
      homeworks = await GroupCourses.findAll({
        where:{trainers: {
          [Op.contains]: [userId],
        }},
        attributes:[['id','GroupCourseId']],
        include: [
              {
                model: Homework,
                attributes: [
                  "id",
                  "courseId",
                  [`title_${language}`, "title"],
                  [`description_${language}`, "description"],
                  "maxPoints",
                  "isOpen",
                  "dueDate",
                ],
                where:{courseId}
              },  
            ],
      }) 
    }else{

      homeworks = await UserHomework.findAll({
        where: { GroupCourseId: courseId, UserId: userId },
        include: [
          {
            model: Homework,
            attributes: [
              "id",
              "courseId",
              [`title_${language}`, "title"],
              [`description_${language}`, "description"],
              "maxPoints",
            ],
          },
        ],
        order: [["id", "DESC"]],
      }); 
    }

    if (!homeworks.length) {
      return res.status(403).json({
        message: "Homeworks not found or User doesn't have the homeworks",
      });
    }


    res.send(homeworks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};


const getHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId,role } = req.user;
    const { language } = req.query;
    let homework;
    if(role=="TEACHER"){
      homework = await GroupCourses.findAll({
        where:{trainers: {
          [Op.contains]: [userId],
        }},
        attributes:[['id','GroupCourseId']],
        include: [
              {
                model: Homework,
                attributes: [
                  "id",
                  "courseId",
                  [`title_${language}`, "title"],
                  [`description_${language}`, "description"],
                  "maxPoints",
                  "isOpen",
                  "dueDate",
                ],
                where:{courseId}
              },  
            ],
      }) 
    }else{

      homework = await UserHomework.findOne({
        where: { HomeworkId: id, UserId: userId },
      attributes: ["points", "status", "answer"],
      include: [
        {
          model: Homework,
          attributes: [
            "id",
            "courseId",
            [`title_${language}`, "title"],
            [`description_${language}`, "description"],
            "maxPoints",
          ],
        },
      ],
    });
  }
    
    if (!homework) {
      return res.status(403).json({
        message: "Homework not found or User doesn't have a homework",
      });
    }

    homework = {
      points: homework.points,
      status: homework.status,
      answer: homework.answer,
      ...homework.dataValues.Homework.dataValues,
    };

    res.send(homework);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const submitHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;
    const { answer } = req.body;

    let homework = await UserHomework.findOne({
      where: { HomeworkId: id, UserId: userId },
    });

    if (!homework) {
      return res.status(403).json({
        message: "Homework not found or User doesn't have a homework",
      });
    }

    homework.answer = answer;
    homework.status = 1;
    await homework.save();

    res.send(homework);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  create,
  open,
  getHomeworks,
  getHomework,
  submitHomework,
};