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
  "application/xml"
];

router.post('/file', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const { file } = req.files;

    const allowedExtensions = ['.sql', '.jmx'];
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
    if (fileExtension === ".sql") {
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

// const ffmpeg = require('fluent-ffmpeg');
// const ffmpegPath = require('ffmpeg-static');  // Use the ffmpeg-static package


// // Set FFmpeg path to the static binary
// ffmpeg.setFfmpegPath(ffmpegPath);

// // Function to sanitize filenames to avoid issues with special characters
// const sanitizeFileName = (fileName) => {
//   return fileName.replace(/[^\w\s.-]/gi, '_');  // Replace non-alphanumeric characters with underscores
// };

// // Route to handle video upload and compression
// router.post('/uploadVideo', async (req, res) => {
//   try {
//     // Ensure a video file is uploaded
//     const videoFile = req.files?.videoFile;
//     if (!videoFile) {
//       return res.status(400).json({ error: 'No video file uploaded' });
//     }

//     // Sanitize filenames to avoid issues with special characters
//     const sanitizedFileName = sanitizeFileName(videoFile.name);

//     // Define paths for original and compressed video files
//     const uploadPath = path.join(__dirname, '..', 'uploadsVideo', `${Date.now()}-${sanitizedFileName}`);
//     const compressedPath = path.join(__dirname, '..', 'uploadsVideo', `compressed-${Date.now()}-${sanitizedFileName}`);

//     // Save the original video file
//     await videoFile.mv(uploadPath);

//     // Log the uploaded file's name and size
//     console.log('Uploaded video file:', sanitizedFileName, videoFile.size);

//     // Compress the video using FFmpeg
//     await new Promise((resolve, reject) => {
//       ffmpeg(uploadPath)
//         .outputOptions([
//           '-vcodec libx264', // Video codec
//           '-crf 35',          // Quality factor (adjust as needed)
//           '-preset fast',     // Compression speed preset
//           '-s 1280x720'       // Set resolution to 720p (1280x720 pixels)
//         ])
//         .save(compressedPath)
//         .on('start', (commandLine) => {
//           console.log('FFmpeg command:', commandLine);
//         })
//         .on('end', () => {
//           console.log('Compression complete.');
//         })
//         .on('stderr', (stderr) => {
//           console.log('FFmpeg stderr:', stderr);
//         })
//         .on('error', (err, stdout, stderr) => {
//           console.error('Error during video compression:', err);
//           console.error('FFmpeg stdout:', stdout);
//           console.error('FFmpeg stderr:', stderr);
//           if (!res.headersSent) {
//             res.status(500).json({ error: 'Failed to compress video' });
//           }
//         });

//     });

//   } catch (error) {
//     console.error('Error:', error);
//     // Ensure only one response is sent
//     if (!res.headersSent) {
//       res.status(500).json({ error: 'An error occurred during the upload' });
//     }
//   }
// });



module.exports = router;
