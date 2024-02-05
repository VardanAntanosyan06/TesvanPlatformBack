const { Groups, Users, Certificates } = require("../models");
const { Op } = require("sequelize");

const findAllStudents = async (req, res) => {
  try {
    let certificates = await Certificates.findAll({
      include: { model: Users, attributes: ["firstName", "lastName"] },
      attributes:['id','userId','status','giveDate']
    });

    // certificates = certificates.map(cert => {
    //     const certificateJson = cert.toJSON(); // Convert model instance to JSON
    //     delete certificateJson.dataValues; // Remove dataValues property
    //     return certificateJson; // Return the modified JSON object
    // });
    certificates = certificates.map((e)=>{
        e = e.toJSON();
        delete e.dataValues;
        e['firstName'] =e.User.firstName 
        e['lastName'] =e.User.lastName
        delete e.User;
        return e;
    })
        return res.status(200).json({ success: true, certificates });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};


module.exports = {
    findAllStudents
}
