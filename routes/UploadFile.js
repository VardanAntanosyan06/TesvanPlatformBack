const uuid = require('uuid');
const path = require('path');
var express = require('express');
const { Users, Video } = require('../models');
const checkAuth = require('../middleware/checkAuth');
var router = express.Router();
var fs = require('fs');

const allowedFormats = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',              // PDF files
  'application/msword',           // .doc files
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx files
  'application/vnd.ms-excel',     // .xls files
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx files
  'application/json', //.json files
  'text/plain',
];

router.post('/file', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const { file } = req.files;

    const allowedExtensions = ['.sql'];
    if (!file.name) {
      return res.status(400).json({ success: false, message: 'File name is missing.' });
    }
  
    const fileExtension = path.extname(file.name).toLowerCase();  

    if (!allowedFormats.includes(file.mimetype)) {
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ success: false, message: 'Unsupported file format' });
      }
    };

    let type = file.mimetype.split('/')[1];
    if(fileExtension === ".sql"){
      type = "sql"
    };
    const fileName = uuid.v4() + '.' + type;
    
    file.mv(path.resolve(__dirname, '..', 'static', fileName));

    return res.json({ url: fileName });
  } catch (e) {
    res.status(500).json({ succes: false });
    console.log(e);
  }
});

router.post('/setDefault', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    // console.log(file);
    // const type = file.mimetype.split("/")[1];
    // const fileName = uuid.v4() + "." + type;
    // file.mv(path.resolve(__dirname, "..", "static", fileName));
    const user = await Users.findByPk(userId);

    user.img = 'defaultIcon.png';
    user.save();
    return res.json({ succes: true });
  } catch (e) {
    res.status(500).json({ succes: false });
    console.log(e);
  }
});

router.delete('/file/:fileName', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const { fileName } = req.params;

    fs.unlinkSync(path.resolve(__dirname, '..', 'static', fileName));

    return res.json({ succes: true });
  } catch (e) {
    res.status(500).json({ succes: false });
    console.log(e);
  }
});

module.exports = router;
