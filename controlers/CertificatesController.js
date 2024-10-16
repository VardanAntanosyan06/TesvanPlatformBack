const { Groups, Users, Certificates } = require('../models');
const { Op } = require('sequelize');

const findAllStudents = async (req, res) => {
  try {
    let certificates = await Certificates.findAll({
      include: { model: Users, attributes: ['firstName', 'lastName', 'image'] },
      attributes: ['id', 'userId', 'status', 'giveDate'],
    });

    let status;
    if (+certificates.status === 1) {
      status = 'Participation';
    } else if (+certificates.status === 2) {
      status = 'Basic Skills';
    } else if (+certificates.status === 3) {
      status = 'Excellence';
    }

    certificates = certificates.map((e) => {
      e = e.toJSON();
      delete e.dataValues;
      e['id'] = e.id;
      e['name'] = e.User.firstName + ' ' + e.User.lastName;
      e['image'] = e.User.image;
      e['points'] = 100;
      e['type'] = status;

      delete e.User;
      return e;
    });
    return res.status(200).json(certificates);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const changeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    const Certificate = await Certificates.findByPk(id);
    if (!Certificate)
      return res.json({ success: false, message: `Certificate with ID ${id} not defined` });

    Certificate.status = status;
    Certificate.giveDate = new Date().toISOString();
    await Certificate.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(403).json({ message: error.message });
    } else {
      return res.status(500).json({ message: 'Something went wrong.' });
    }
  }
};

const getUserCertificates = async (req, res) => {
  try {
    const { user_id: userId } = req.user;

    let certificates = await Certificates.findAll({
      where: { userId },
      attributes: ['id', 'userId', 'status', 'giveDate', 'courseName', 'url'],
      include: { model: Users, attributes: ['firstName', 'lastName'] },
    });

    certificates = certificates.map((e) => {
      e = e.toJSON();
      // delete e.dataValues;
      e['id'] = e.id;
      e['firstName'] = e.User.firstName;
      e['lastName'] = e.User.lastName;
      delete e.User;
      return e;
    });
    return res.status(200).json({ success: true, certificates });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const { generateCertificate } = require('../generateCertificate/generateCertificate');
const pdf = require('html-pdf');
const fs = require('fs').promises;
const path = require('path');

const downloadCertificate = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the certificate data from the database
    const certificate = await Certificates.findOne({
      where: { id: id },
      attributes: ['id', 'userId', 'status', 'giveDate', 'courseName', 'url'],
      include: { model: Users, attributes: ['firstName', 'lastName'] },
    });

    if (!certificate) {
      return res.status(404).send('Certificate not found');
    }

    const userName = `${certificate.User.firstName} ${certificate.User.lastName}`;
    const courseName = certificate.courseName;
    const giveDate = certificate.giveDate.toString().split(' ');
    const date = `${giveDate[1]} ${giveDate[2]} ${giveDate[3]}`;
    const year = giveDate[3];


    // // Generate the certificate buffer
    // const certificateBuffer = await generateCertificate(
    //   certificate.status,
    //   userName,
    //   courseName,
    //   date,
    //   year
    // );

    // Define paths
    const htmlFilePath = path.join(__dirname, '../generateCertificate', 'certificate.html');
    const cssFilePath = path.join(__dirname, '../generateCertificate', 'styles.css');

    // Choose the image based on status
    const imagePath = path.join(__dirname, '../generateCertificate',
      certificate.status === 3 ? 'Excellence.png' :
        certificate.status === 2 ? 'Basic Skills.png' : 'Participation.png'
    );

    const [cssData, htmlData, imgBuffer] = await Promise.all([
      fs.readFile(cssFilePath, 'utf-8'),
      fs.readFile(htmlFilePath, 'utf-8'),
      fs.readFile(imagePath)
    ]);

    // Convert image to base64
    const imgBase64 = imgBuffer.toString('base64');

    const htmlWithStyles = `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@500&display=swap" rel="stylesheet">
        <title>Certificate of Excellence</title>
        <style>
          ${cssData}
          .certificate {
            width: 372mm;
            height: 262mm;
            background-image: url('data:image/png;base64,${imgBase64}');
            background-size: 372mm 262mm;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
        </style>
      </head>
      <body>
        ${htmlData}
        <script>
          document.querySelector(".userName").innerHTML = "${userName}";
          document.querySelector(".date").innerHTML = "${date}";
          document.querySelector(".courseName").innerHTML = "${courseName}";
          document.querySelector(".month").innerHTML = "${new Date().getMonth() + 1}"; // Dynamic month
          document.querySelector(".year").innerHTML = "${year}";
        </script>
      </body>
      </html>
    `;

    const options = {
      format: 'A4',
      orientation: 'landscape',
    };

    pdf.create(htmlWithStyles, options).toBuffer((err, buffer) => {
      if (err) {
        return reject(err);
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=certificate-${id}.pdf`);
      res.send(buffer);
    });

  } catch (error) {
    console.error('Error generating or downloading certificate:', error);
    res.status(500).send('Internal server error');
  }
};


module.exports = {
  findAllStudents,
  changeStatus,
  getUserCertificates,
  downloadCertificate,
};
