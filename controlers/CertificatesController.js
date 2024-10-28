const { Groups, Users, Certificates, UserCourses } = require('../models');
const { Op } = require('sequelize');

const findAllStudents = async (req, res) => {
  try {
    let certificates = await Certificates.findAll({
      include: [
        {
          model: Users,
          attributes: ['firstName', 'lastName', 'image']
        }
      ],
      attributes: ['id', 'userId', 'status', 'giveDate', 'point'],
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
      console.log(e, 444);
      delete e.dataValues;
      e['id'] = e.id;
      e['name'] = e.User.firstName + ' ' + e.User.lastName;
      e['image'] = e.User.image;
      e['points'] = +(Number(e.point).toFixed(2));
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

const PDFDocument = require('pdfkit');
const fs = require('fs');

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
    const giveDate = new Date(certificate.giveDate);
    const years = giveDate.toString().split(" ")[3]
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = giveDate.toLocaleDateString('en-US', dateOptions);
    const month = 3

    // Create a PDF document with A4 format and landscape orientation
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
    });

    // Set headers for PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${id}.pdf`);

    // Pipe the PDF output to the response
    doc.pipe(res);

    // Optional: Add an image
    let imagePath;

    if (certificate.status === 3) {
      imagePath = './generateCertificate/Excellence.png'
    } else if (certificate.status === 2) {
      imagePath = './generateCertificate/Basic Skills.png'
    } else {
      imagePath = './generateCertificate/Participation.png'
    }

    if (fs.existsSync(imagePath)) {
      doc.image(imagePath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });
    } else {
      console.error('Image file does not exist:', imagePath, 55);
    }

    // Set a custom bold font or use Helvetica-Bold
    const customBoldFontPath = './generateCertificate/FiraSans-Bold.ttf'; // Update this to your custom bold font path
    if (fs.existsSync(customBoldFontPath)) {
      doc.font(customBoldFontPath); // Use custom bold font
    } else {
      console.error('Custom bold font file does not exist, using Helvetica-Bold');
      doc.font('Helvetica-Bold'); // Fallback to Helvetica-Bold if custom font is not found
    }
    // Set the text color to #1b405a (deep blue)
    const textColor = '#1b405a';
    // Add content to the PDF
    doc.moveDown(16);
    doc.fillColor('#0f1f2a').fontSize(36).text(userName, { align: 'center', bold: true });
    doc.moveDown(0.54);
    doc.fillColor('#1b405a').fontSize(19).text(`                                                                                     ${month}                 ${courseName}`, { align: 'left', bold: true });
    doc.moveDown(0.06);
    doc.fillColor('#1b405a').fontSize(19).text(`                                                                 ${years}`, { align: 'left', bold: true });
    doc.moveDown(3);
    doc.fillColor('#0f1f2a').fontSize(16).text(`                                    ${formattedDate}`, { align: 'left', bold: true });

    // Finalize the PDF
    doc.end();

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
