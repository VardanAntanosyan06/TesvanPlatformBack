const { Calendar } = require("../models");
const { Op, where } = require("sequelize");

const create = async (req, res) => {
  try {
    const { title, start, end, description, format, link, type, userId } =
      req.body;
    await Calendar.create({
      title,
      start,
      end,
      description,
      format,
      link,
      type,
      userId,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;
    const task = await Calendar.findOne({
      where: { id, userId: { [Op.contains]: [userId] } },
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "You don't have task width id "+id });
    }
    return res.status(200).json({ success: true, task });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const findTodays = async (req, res) => {
  try {
    const day = new Date();
    const { user_id: userId } = req.user;

    const startOfDay = new Date(
      Date.UTC(
        day.getUTCFullYear(),
        day.getUTCMonth(),
        day.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );
    const endOfDay = new Date(
      Date.UTC(
        day.getUTCFullYear(),
        day.getUTCMonth(),
        day.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );
    const task = await Calendar.findAll({
      where: {
        createdAt: { [Op.between]: [startOfDay, endOfDay] },
        userId: { [Op.contains]: [userId] },
      },
    });
    if (task.length < 0) {
      return res
        .status(404)
        .json({ success: false, message: "You don't have any tasks" });
    }
    return res.status(200).json({ success: true, task });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const findThisYear = async (req, res) => {
  try {
    const day = new Date();
    const { user_id: userId } = req.user;

    const startOfYear = new Date(
      Date.UTC(day.getUTCFullYear(), 0, 1, 0, 0, 0, 0)
    );
    const endOfYear = new Date(
      Date.UTC(day.getUTCFullYear(), 11, 31, 23, 59, 59, 999)
    );
    const tasks = await Calendar.findAll({
      where: {
        createdAt: { [Op.between]: [startOfYear, endOfYear] },
        userId: { [Op.contains]: [userId] },
      },
    });
    if (tasks.length < 0) {
      return res
        .status(404)
        .json({ success: false, message: "You don't have any tasks" });
    }
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const findThisMonth = async (req, res) => {
  try {
    const { user_id: userId } = req.user;

    const day = new Date();
    const startOfMonth = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1, 0, 0, 0, 0)
    );
    const endOfMonth = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth() + 1, 0, 23, 59, 59, 999)
    );
    const tasks = await Calendar.findAll({
      where: {
        createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
        userId: { [Op.contains]: [userId] },
      },
    });
    if (tasks.length < 0) {
      return res
        .status(404)
        .json({ success: false, message: "You don't have any tasks" });
    }
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const findAll = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const task = await Calendar.findAll({
      where: { userId: { [Op.contains]: [userId] } },
    });
    if (task.length < 0) {
      return res
        .status(404)
        .json({ success: false, message: "You don't have any tasks" });
    }
    return res.status(200).json({ task });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.body;

    const updateFields = {};
    const fields = [
      "title",
      "start",
      "end",
      "description",
      "format",
      "link",
      "type",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== null && req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const [updatedRows] = await Calendar.update(updateFields, {
      where: { id },
    });

    if (updatedRows > 0) {
      return res
        .status(200)
        .json({ success: true, message: "Record updated successfully." });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Record not found." });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const status = await Calendar.destroy({
      where: { id },
    });
    if(status==0){
        return res.status(404).json({success:false,message:"task not found"})
    }
    return res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  create,
  findOne,
  findTodays,
  findThisMonth,
  findThisYear,
  findAll,
  remove,
  update,
};
