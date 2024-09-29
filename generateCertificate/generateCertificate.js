const pdf = require('html-pdf');
const fs = require('fs').promises;
const path = require('path');

async function generateCertificate(status, userName, courseName, date) {
    try {
        const htmlFilePath = path.join(__dirname, '.', 'certificate.html');
        const cssFilePath = path.join(__dirname, '.', 'styles.css');
        let imagePath;

        if (status === 3) {
            imagePath = path.join(__dirname, '.', 'photo_2024-09-22_20-27-36.jpg');
        } else if (status === 2) {
            imagePath = path.join(__dirname, '.', 'photo_2024-09-22_20-27-36.jpg');
        } else {
            imagePath = path.join(__dirname, '.', 'photo_2024-09-22_20-27-36.jpg');
        }

        // Read files using async/await
        const cssData = await fs.readFile(cssFilePath, 'utf-8');
        const htmlData = await fs.readFile(htmlFilePath, 'utf-8');
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
                    ${cssData}
                    .certificate {
                        width: 372mm;
                        height: 262mm;
                        background-image: url('data:image/png;base64,${imgBase64}');
                        background-size: 372mm 262mm;
                    }
                </style>
            </head>
            <body>
                ${htmlData}
                <script>
                    document.querySelector(".userName").innerHTML = "${userName}";
                    document.querySelector(".date").innerHTML = "${date}";
                    document.querySelector(".courseName").innerHTML = "${courseName}";
                </script>
            </body>
            </html>
        `;

        const options = {
            format: 'A4',
            orientation: 'landscape',
        };

        // Wrap the PDF creation in a Promise to handle it with async/await
        return new Promise((resolve, reject) => {
            pdf.create(htmlWithStyles, options).toStream((err, stream) => {
                if (err) {
                    return reject(err);
                }
                resolve(stream);  // Return the stream for the response
            });
        });

    } catch (error) {
        console.log('Error generating certificate:', error);
        throw error;
    }
}

module.exports = {
    generateCertificate
};

