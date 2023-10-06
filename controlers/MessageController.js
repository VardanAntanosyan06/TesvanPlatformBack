const { Message, Users, UserHomework, UserCourses } = require("../models");
const { userSockets } = require("../userSockets");

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

    const userSocket = userSockets.get(userId);
    if (userSocket) {
      userSocket.emit(("new-message", "Hello World!"));
    }

    res.send(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getNewMessages = async (req, res) => {
  try {
    const { user_id: id } = req.user;
    const { language } = req.query;

    const messages = await Message.findAll({
      where: { UserId: id, isNew: true },
      order: [["id", "DESC"]],
      attributes: [
        "id",
        "type",
        [`title_${language}`, "title"],
        [`description_${language}`, "description"],
      ],
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
    const { language } = req.query;

    const messages = await Message.findAll({
      where: { UserId: id },
      order: [["id", "DESC"]],
      attributes: [
        "id",
        "type",
        [`title_${language}`, "title"],
        [`description_${language}`, "description"],
      ],
    });

    res.send(messages);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const markAllMessages = async (req, res) => {
  try {
    const { user_id: id } = req.user;

    const messages = await Message.update(
      {
        isNew: false,
      },
      {
        where: { UserId: id, isNew: true },
      }
    );

    res.send(messages);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const markMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;

    const message = await Message.update(
      {
        isNew: false,
      },
      {
        where: { UserId: userId, id },
      }
    );

    res.send(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  send,
  getNewMessages,
  getAllMessages,
  markAllMessages,
  markMessage,
};
