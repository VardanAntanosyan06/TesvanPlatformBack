// const pdf = require('html-pdf');
// const fs = require('fs').promises;
// const path = require('path');

// const generateCertificate = async (status, userName, courseName, date, year) => {
//   try {
//     const htmlFilePath = path.join(__dirname, '.', 'certificate.html');
//     const cssFilePath = path.join(__dirname, '.', 'styles.css');
//     let imagePath;

//     if (status === 3) {
//       imagePath = path.join(__dirname, '.', 'Excellence.png');
//     } else if (status === 2) {
//       imagePath = path.join(__dirname, '.', 'Basic Skills.png');
//     } else {
//       imagePath = path.join(__dirname, '.', 'Participation.png');
//     }

//     // Read files using async/await
//     const cssData = await fs.readFile(cssFilePath, 'utf-8');
//     const htmlData = await fs.readFile(htmlFilePath, 'utf-8');
//     const imgBuffer = await fs.readFile(imagePath);
//     const imgBase64 = imgBuffer.toString('base64'); // Convert to base64

//     // Inject CSS into HTML
//     const htmlWithStyles = `
//             <html lang="en">
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <link href="https://fonts.googleapis.com/css2?family=Teko:wght@500&display=swap" rel="stylesheet">
//                 <title>Certificate of Excellence</title>
//                 <style>
//                     ${cssData}
//                     .certificate {
//                         width: 372mm;
//                         height: 262mm;
//                         background-image: url('data:image/png;base64,${imgBase64}');
//                         background-size: 372mm 262mm;
//                         position: relative;
//                         display: flex;
//                         flex-direction: column;
//                         align-items: center;
//                         justify-content: center;
//                         text-align: center;
//                     }
//                 </style>
//             </head>
//             <body>
//                 ${htmlData}
//                 <script>
//                     document.querySelector(".userName").innerHTML = "${userName}";
//                     document.querySelector(".date").innerHTML = "${date}";
//                     document.querySelector(".courseName").innerHTML = "${courseName}";
//                     document.querySelector(".month").innerHTML = "${3}";
//                     document.querySelector(".year").innerHTML = "${year}";
//                 </script>
//             </body>
//             </html>
//         `;

//     const options = {
//       format: 'A4',
//       orientation: 'landscape',
//     };

//     // const fileName = `Tesvan_Certificate.pdf`;
//     // const filePath = path.join(__dirname, '../static', fileName);
//     const createPdfBuffer = (htmlWithStyles, options) => {
//       return new Promise((resolve, reject) => {
//         pdf.create(htmlWithStyles, options).toBuffer((err, buffer) => {
//           if (err) {
//             return reject(err);
//           }
//           resolve(buffer);
//         });
//       });
//     };

//     return createPdfBuffer(htmlWithStyles, options)



//     // // Wrap the PDF creation in a Promise to handle it with async/await
//     // return new Promise((resolve, reject) => {
//     //     pdf.create(htmlWithStyles, options).toBuffer((err, buffer) => {
//     //         if (err) {
//     //             return reject(err);
//     //         }
//     //         resolve(buffer);  // Return the stream for the response
//     //     });
//     // });
//   } catch (error) {
//     console.log('Error generating certificate:', error);
//     throw error;
//   }
// };

// module.exports = {
//   generateCertificate,
// };


const pdf = require('html-pdf');
const fs = require('fs').promises;
const path = require('path');

// Function to create PDF as a buffer
const createPdfBuffer = (htmlWithStyles, options) => {
  return new Promise((resolve, reject) => {
    pdf.create(htmlWithStyles, options).toBuffer((err, buffer) => {
      if (err) {
        return reject(err);
      }
      resolve(buffer);
    });
  });
};

const generateCertificate = async (status, userName, courseName, date, year) => {
  try {
    // Define paths
    const htmlFilePath = path.join(__dirname, '.', 'certificate.html');
    const cssFilePath = path.join(__dirname, '.', 'styles.css');

    // Choose the image based on status
    const imagePath = path.join(__dirname, '.', 
      status === 3 ? 'Excellence.png' :
      status === 2 ? 'Basic Skills.png' : 'Participation.png'
    );

    // Read the necessary files
    const [cssData, htmlData, imgBuffer] = await Promise.all([
      fs.readFile(cssFilePath, 'utf-8'),
      fs.readFile(htmlFilePath, 'utf-8'),
      fs.readFile(imagePath)
    ]);
    
    // Convert image to base64
    const imgBase64 = imgBuffer.toString('base64');

    // Inject CSS, image, and dynamic data into HTML
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

    // Generate PDF buffer and return it
    return await createPdfBuffer(htmlWithStyles, options);

  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};

module.exports = {
  generateCertificate,
};
