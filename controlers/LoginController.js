const { Model } = require("sequelize");
const { Users } = require("../models");
const bcrypt = require("bcrypt");

const LoginUsers = async (req, res) => {
  try {
    const { email, password } = req.body;

    const User = await Users.findOne({
      where: { email },
    });
    if (User && User.isVerified && (await bcrypt.compare(password,User.password))){
      return res.status(200).json({ User });
    }
    return res.status(404).json({ message: "Invalid email or password!" });
  } catch (error) {
    console.log(error);
  }
};


module.exports = {
  LoginUsers
}