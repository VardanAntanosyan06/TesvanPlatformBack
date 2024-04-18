// const { Lesson, Presentations } = require('../models');

// const { v4 } = require('uuid');
// const path = require('path');

// const createPresentation = async (req, res) => {
//   try {
//     const { title, lessonId } = req.body;
//     let { file } = req.files;

//     const fileType = file.mimetype.split('/')[1];
//     const fileName = v4() + '.' + fileType;
//     file.mv(path.resolve(__dirname, '..', 'static', fileName));

//     const lesson = await Presentations.findOne({ where: { lessonId } });
//     if (lesson) {
//       return res.status(400).json({ message: 'Lesson Already have a Presentation' });
//     }
//     await Presentations.create({
//       title,
//       lessonId,
//       url: fileName,
//     });
//     return res.status(200).json({ success: true });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: 'Something Went Wrong .' });
//   }
// };

// module.exports = {
//   createPresentation,
// };
