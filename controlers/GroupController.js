const { Groups, UserCourses, Users, JoinCart,Certificates } = require("../models");
const { v4 } = require("uuid");
const groups = require("../models/groups");
const sequelize = require("sequelize");
const {Op} = require("sequelize");

const CreateGroup = async (req, res) => {
  try {
    const { name, assignCourseId, users } = req.body;

    let groupeKey = `${process.env.HOST}-joinLink-${v4()}`;

    const task = await Groups.create({
      name,
      groupeKey,
    });
    users.map((e) => {
      return UserCourses.create({
        GroupCourseId: task.id,
        UserId: e,
      });
    });

    return res.status(200).json({ success: true, task });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Groups.findOne({
      where: { id },
      include: {
        model: UserCourses,
        attributes: ["id", "UserId"],
        include: {
          model: Users,
          attributes: ["firstName", "lastName", "role"],
        },
      },
    });

    if (!group)
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });

    return res.status(200).json({ success: true, group });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const findAll = async (req, res) => {
  try {
    const group = await Groups.findAll({
      include: {
        model: UserCourses,
        attributes: ["id", "UserId"],
        include: {
          model: Users,
          attributes: ["firstName", "lastName", "role"],
        },
      },
    });

    if (group.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });

    return res.status(200).json({ success: true, group });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, assignCourseId } = req.body;
    const Group = await Groups.findOne({
      where: {
        id,
      },
    });
    if (!Group)
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });

    if (name) Group.name = name;
    if (assignCourseId) Group.assignCourseId = assignCourseId;

    Group.save();
    return res
      .status(200)
      .json({ success: true, message: "Updated successful" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Groups.destroy({ where: { id } });

    console.log(task);
    return res
      .status(200)
      .json({ success: true, message: "deleted successful" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const addMember = async (req, res) => {
  try {
    const { groupId, users } = req.body;
    users.map((e) => {
      console.log(e);
      UserCourses.findOne({
        where: { id: 1 },
      }).then((result) => {
        // console.log(result);
      });
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const SingleUserStstic = async (req, res) => {
  try {
    const { id, userId } = req.query;

    const UserInfo = await UserCourses.findOne({
      where: { groupId: id, userId },
      attributes: [
        "personalSkils",
        "professionalSkils",
        "certification",
        "lessons",
        "homeWork",
        "quizzes",
      ],
    });

    if (!UserInfo)
      return res
        .status(404)
        .json({ success: false, message: "Invalid id or userId" });

    return res.status(200).json({ success: true, UserInfo });
  } catch (error) {
    console.log(error.message, error.name);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const AddUserSkill = async (req, res) => {
  try {
    const { groupId, userId, skill, type } = req.body;

    const User = await UserCourses.findOne({
      where: { groupId, userId },
    });
    if (!User)
      return res
        .status(404)
        .json({ success: false, message: "Invalid id or userId" });

    if (!Array.isArray(skill))
      return res
        .status(403)
        .json({ success: false, message: "Skill must be an array" });

    if (type === "professional") {
      User.personalSkils = [...User.personalSkils, ...skill];
      User.save();
    } else if (type === "personal") {
      User.professionalSkils = [...User.professionalSkils, ...skill];

      User.save();
    } else {
      return res.status(403).json({
        success: false,
        message: "Type must be professional or personal",
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const recordUserStatics = async (req, res) => {
  try {
    const { groupId } = req.body;

    if (!groupId)
      return res
        .status(403)
        .json({ success: false, message: "groupId cannot be null" });

    const group = await Groups.findByPk(groupId);
    if (!group)
      return res.status(403).json({ success: false, message: "Wrong groupId" });
    const month = new Date().getMonth() + 1;
    await JoinCart.create({ groupId, month });

    return res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getUserStaticChart = async (req, res) => {
  try {
    const { groupId } = req.params;

    // const statics = await JoinCart.findAll({ where: { groupId } });

    let statics = await JoinCart.findAll({
      attributes: [[sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      where: { groupId },
      group: ["month"],
      order: [["month", "ASC"]],
    });
    const UserCount = await Users.count();
    statics = statics.map((e) => (+e.dataValues.count / UserCount) * 100);
    return res.json({ statics,UserCount });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const finishGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const Group = await Groups.findOne(
      {
        where: {
          id,
        },
        include:{model:UserCourses}
      }
    );

    if(!Group) return res.json({success:false,message:`Group with ID ${id} not defined`})

    Group.UserCourses.map((e)=>{
      if(e.totalPoints>=10){
        Certificates.create({
          userId: e.UserId
        })
        return
      }
    })
    Group.finished = true
    Group.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  CreateGroup,
  findOne,
  findAll,
  update,
  remove,
  addMember,
  SingleUserStstic,
  recordUserStatics,
  AddUserSkill,
  getUserStaticChart,
  finishGroup,
};