const { Message, Users, UserHomework, UserCourses } = require("../models");

const send = async (req, res) => {
  try {
    const { userId, title } = req.body;

    const message = await Message.create({
      UserId: userId,
      title: title,
    });

    req.io.emit("new-message", "Hello World!");

    res.send(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getUserMessages = async (req, res) => {
  try {
    const { user_id: id } = req.user;

    const messages = await Message.findAll({
      where: { UserId: id },
    });

    res.send(messages);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  send,
  getUserMessages,
};
