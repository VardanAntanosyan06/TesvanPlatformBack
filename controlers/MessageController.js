const { Message, Users, UserHomework, UserCourses } = require("../models");

const send = async (req, res) => {
  try {
    const {
      userId,
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      type,
    } = req.body;

    const message = await Message.create({
      UserId: userId,
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      type,
    });

    req.io.emit("new-message", "Hello World!");

    res.send(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getNewMessages = async (req, res) => {
  try {
    const { user_id: id } = req.user;

    const messages = await Message.findAll({
      where: { UserId: id, isNew: true },
      order: [["id", "DESC"]],
    });

    res.send(messages);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const { user_id: id } = req.user;

    const messages = await Message.findAll({
      where: { UserId: id },
      order: [["id", "DESC"]],
    });

    res.send(messages);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  send,
  getNewMessages,
  getAllMessages,
};
