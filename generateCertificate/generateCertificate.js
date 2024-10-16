const pdf = require('html-pdf');
const fs = require('fs').promises;
const path = require('path');

const generateCertificate = async (status, userName, courseName, date, year) => {
  try {
    let imagePath;

    if (status === 3) {
      imagePath = path.join(__dirname, '.', 'Excellence.png');
    } else if (status === 2) {
      imagePath = path.join(__dirname, '.', 'Basic Skills.png');
    } else {
      imagePath = path.join(__dirname, '.', 'Participation.png');
    }

    // Read files using async/await
    const imgBuffer = await fs.readFile(imagePath);
    const imgBase64 = imgBuffer.toString('base64'); // Convert to base64

    // Inject CSS into HTML
    const htmlWithStyles = `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <title>Certificate of Excellence</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                    }

                    .userName {
                        position: relative;
                        text-align: center;
                        top: 130mm;
                    }

                    .userName {
                        font-family: 'Teko', sans-serif;
                        font-size: 65px;
                        color: #12222D;
                        font-weight: 500;
                    }

                    .courseName {
                        position: relative;
                        text-align: left;
                        top: 129.3mm;
                        left: 240mm;

                    }

                    .courseName {
                        font-family: 'Fira Sans', sans-serif;
                        font-weight: 500;
                        color: #143E59;
                        font-size: 30px;
                        font-weight: bold;
                    }

                    .month {
                        position: relative;
                        text-align: center;
                        top: 119.9mm;
                        left: 18mm;
                    }

                    .month {
                        font-family: 'Fira Sans', sans-serif;
                        font-weight: 500;
                        color: #143E59;
                        font-size: 30px;
                        font-weight: bold;
                    }

                    .year {
                        position: relative;
                        top: 120.5mm;
                        right: 17mm;
                    }

                    .year {
                        font-family: 'Fira Sans', sans-serif;
                        font-weight: 500;
                        color: #143E59;
                        font-size: 29px;
                        font-weight: bold;
                    }

                    .date {
                        position: relative;
                        text-align: center;
                        top: 189mm;
                        right: 72mm
                    }

                    .date {
                        font-family: 'Fira Sans', sans-serif;
                        font-weight: 400;
                        color: #12222D;
                        font-size: 28px;
                        font-weight: bold;
                    }
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
                <div class="certificate-container">
                  <div class="certificate">
                    <p class="userName">${userName}</p>
                    <p class="date">${date}</p>
                    <p class="courseName">${courseName}</p>
                    <p class="month">${3}</p>
                    <p class="year">${year}</p>
                  </div>
              </div>
            </body>
            </html>
        `;

    const options = {
      format: 'A4',
      orientation: 'landscape',
    };

    const fileName = `Tesvan_Certificate.pdf`;
    const filePath = path.join(__dirname, '../static', fileName);
    // pdf.create(htmlWithStyles, options).toFile(filePath, (err, file) => {
    //   if (err) {
    //     console.log(err);
    //   }
    // });

    // return fileName;

    // Wrap the PDF creation in a Promise to handle it with async/await
    return new Promise((resolve, reject) => {
        pdf.create(htmlWithStyles, options).toFile(filePath,(err, buffer) => {
            if (err) {
                return reject(err);
            }
            resolve(fileName);  // Return the stream for the response
        });
    });
  } catch (error) {
    console.log('Error generating certificate:', error);
    throw error;
  }
};

module.exports = {
  generateCertificate,
};
