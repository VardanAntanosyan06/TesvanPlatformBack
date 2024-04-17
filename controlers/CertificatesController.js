const { Groups, Users, Certificates } = require("../models");
const { Op } = require("sequelize");

const findAllStudents = async (req, res) => {
  try {
    let certificates = await Certificates.findAll({
      include: { model: Users, attributes: ["firstName", "lastName"] },
      attributes: ["id", "userId", "status", "giveDate"],
    });

    certificates = certificates.map((e) => {
      e = e.toJSON();
      delete e.dataValues;
      e["firstName"] = e.User.firstName;
      e["lastName"] = e.User.lastName;
      delete e.User;
      return e;
    });
    return res.status(200).json({ success: true, certificates });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const changeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    const Certificate = await Certificates.findByPk(id);
    if (!Certificate) return res.json({ success: false, message: `Certificate with ID ${id} not defined` });

    Certificate.status = status;
    Certificate.giveDate = new Date().toISOString();
    await Certificate.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    if (error.name === "SequelizeValidationError") {
      return res.status(403).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};


const getUserCertificates = async(req,res)=>{
  try {
    const {user_id:userId} = req.user;

    let certificates = await Certificates.findAll({
      where:{userId},
      attributes: ["id", "userId", "status", "giveDate"],
      include: { model: Users, attributes: ["firstName", "lastName"] },
    });

    certificates = certificates.map((e) => {
      e = e.toJSON();
      delete e.dataValues;
      e["firstName"] = e.User.firstName;
      e["lastName"] = e.User.lastName;
      delete e.User;
      return e;
    });
    return res.status(200).json({ success: true, certificates });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
}
module.exports = {
  findAllStudents,
  changeStatus,
  getUserCertificates
};
