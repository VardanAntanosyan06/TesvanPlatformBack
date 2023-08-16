const { Users } = require("../models");
const bcrypt = require("bcrypt");

const LoginUsers = async (req, res) => {
  try {
    const { email, password } = req.body;

    const User = await Users.findAll({
      where: {email},
    });
    if(!User) return res.status(404).json({message:"Invalid email or password!"})
  
          if(await bcrypt.compare(password, User.password) && User.isVerified){
                    return res.status(200).json({User})
          }
} catch (error) {
    console.log(error);
  }
};
