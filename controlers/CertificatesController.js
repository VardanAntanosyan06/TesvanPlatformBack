const { Groups, Users, Certificates } = require("../models");
const { Op } = require("sequelize");

const findAllStudents = async (req, res) => {
  try {
    let certificates = await Certificates.findAll({
      include: { model: Users, attributes: ["firstName", "lastName", "image"] },
      attributes: ["id", "userId", "status", "giveDate"],
    });

    certificates = certificates.map((e) => {
      e = e.toJSON();
      delete e.dataValues;
      e["name"] = e.User.firstName + " " + e.User.lastName;
      e["image"] = e.User.image;
      e["points"] = 100
      e["type"] = "excellence"


      delete e.User;
      return e;
    });
    return res.status(200).json(certificates);
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
    if (error.name === "SequelizeValidationError") {
      return res.status(403).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};


const getUserCertificates = async (req, res) => {
  try {
    const { user_id: userId } = req.user;

    let certificates = await Certificates.findAll({
      where: { userId },
      attributes: ["id", "userId", "status", "giveDate", "courseName", "url"],
      include: { model: Users, attributes: ["firstName", "lastName"] },
    });

    certificates = certificates.map((e) => {
      e = e.toJSON();
      // delete e.dataValues;
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

const { generateCertificate } = require('../generateCertificate/generateCertificate')
const downloadCertificate = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the certificate data from the database
    const certificate = await Certificates.findOne({
      where: { id }
    });

    if (!certificate) {
      return res.status(404).send('Certificate not found');
    }

    // Generate the certificate stream
    const certificateStream = await generateCertificate(certificate.status, "mher", "courseName", "date");

    // Set headers for downloading the file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate_${certificate.id}.pdf`);

    // Pipe the certificate PDF stream to the response
    certificateStream.pipe(res);
  } catch (error) {
    console.error('Error generating or downloading certificate:', error);
    res.status(500).send('Internal server error');
  }
};
module.exports = {
  findAllStudents,
  changeStatus,
  getUserCertificates,
  downloadCertificate
};
