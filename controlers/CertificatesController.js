const { Groups, Users, Certificates } = require("../models");
const { Op } = require("sequelize");

const findAllStudents = async (req, res) => {
  try {
    let certificates = await Certificates.findAll({
      include: { model: Users, attributes: ["firstName", "lastName", "image"] },
      attributes: ["id", "userId", "status", "giveDate"],
    });

    let status
    if (+certificates.status === 1) {
      status = "Participation"
    } else if (+certificates.status === 2) {
      status = "Basic Skills"
    } else if (+certificates.status === 3) {
      status = "Excellence"
    }

    certificates = certificates.map((e) => {
      e = e.toJSON();
      delete e.dataValues;
      e["id"] = e.id
      e["name"] = e.User.firstName + " " + e.User.lastName;
      e["image"] = e.User.image;
      e["points"] = 100
      e["type"] = status


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
      e["id"] = e.id
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
      where: { id },
      attributes: ["id", "userId", "status", "giveDate", "courseName", "url"],
      include: { model: Users, attributes: ["firstName", "lastName"] },
    });

    if (!certificate) {
      return res.status(404).send('Certificate not found');
    }

    const userName = `${certificate.User.firstName} ${certificate.User.lastName}`;
    const courseName = certificate.courseName;
    const giveDate = certificate.giveDate.toString().split(" ")
    const date = `${giveDate[1]} ${giveDate[2]} ${giveDate[3]}`
    const year = giveDate[3]

    // Generate the certificate stream
    const certificateStream = await generateCertificate(certificate.status, userName, courseName, date, year);

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
