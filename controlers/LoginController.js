const { Users, UserCourses, Email, GroupChats } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const nodemailer = require('nodemailer');
const path = require('path');
const mg = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const { v4 } = require('uuid');
const { UserRegistartionSendEmail } = require('../controlers/RegisterController');

const LoginUsers = async (req, res) => {
  try {
    const { email, password } = req.body;

    const User = await Users.findOne({
      where: { email },
    });

    if (User && !User.isVerified) {
      return res.status(200).json({ isVerified: false });
    }

    if (User && User.isVerified && (await bcrypt.compare(password, User.password))) {
      return res.status(200).json({ User });
    }

    return res.status(403).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.log(error);
  }
};

const sendEmailForForgotPassword = async (req, res) => {
  try {
    const { email } = req.query;

    const User = await Users.findOne({ where: { email } });
    if (!User || (User && !User.isVerified))
      return res.status(403).json({ message: 'There is not verified user' });

    User.token = jwt.sign({ user_id: User.id, email, role: User.role }, process.env.SECRET);
    User.tokenCreatedAt = moment();
    await User.save();

    // Initialize Mailgun client

    const data = {
      from: 'verification@tesvan.com',
      to: email,
      subject: 'Forgot Password Tesvan Platform',
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
          <link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet" />
        </head>
        <body>
          <center style="height:1000px;">
            <h1 style="font-style: normal; font-weight: 600; font-size: 32px; line-height: 48px;">Forgot Password Tesvan Platform</h1>

            <img src='https://platform.tesvan.com/server/forgotPassword.png' alt="" style="width:185px;" />
            
            <div style="width: 70%">
              <h1 style="font-style: normal; font-weight: 600; font-size: 32px; line-height: 48px;">Please verify your email address.</h1>
              <p style="font-style: normal; font-size: 20px; text-align: left;">In order to complete your registration and start preparing for college admissions, you'll need to verify your email address.</p>
              <p style="font-style: normal; font-size: 20px; text-align: left;">You've entered ${email} as the email address for your account. Please verify this email address by clicking the button below.</p>
              <a href="http://platform.tesvan.com/changePassword?token=${User.token}" style="text-decoration:none">
                <div style="width: 130px; height: 40px; background: #FFC038; border-radius: 5px; border:none; font-style: normal; font-weight: 500; font-size: 18px; line-height: 27px; color: #143E59; cursor:pointer; padding:7px; box-sizing:border-box;">Verify</div>
              </a>
            </div>
            <div style="width: 70%; margin-top: 30px; border-top: 1px solid #d4d4d4; border-bottom: 1px solid #d4d4d4;">
              <p style="font-size: 20px; line-height: 30px;text-align:left;">If the button is not working, please use the link below:
                <a href="http://platform.tesvan.com/changePassword?token=${User.token}" style="color: #425dac; text-align:left; font-size:18px;">https://platform.tesvan.com/verify?token=${User.token}</a>
              </p>
            </div>
            <div style="width: 70%; margin-top: 25px; margin-bottom: 25px; border-top: 1px solid #d4d4d4; border-bottom: 1px solid #d4d4d4;">
              <p style="display:flex; font-weight: 500; font-size: 18px; line-height: 27px; color: #646464; text-align: left;">Regards,</p>
              <div style="display:flex;">
                <img src="https://platform.tesvan.com/server/Frame.png" alt="" width="50px" />
              </div>
              <p style="display:flex; font-weight: 500; font-size: 18px; line-height: 27px; color: #646464; text-align: left;"></p>
            </div>
            <div style="width:70%">
              <p style="font-style: normal; font-weight: 500; font-size: 18px; line-height: 27px; color: #646464; text-align: center; margin-top:15px;">© 2024 Tesvan, All rights reserved</p>
            </div>
          </center>
          <style>
            * { color:black; }
            div { display: flex; flex-direction: column; justify-content: center; align-items: center; }
            p { text-align: left; }
            a { color: unset; }
          </style>
        </body>
      </html>`,
    };

    mg.messages().send(data, (error, body) => {
      if (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Failed to send email' });
      }
      console.log('Email sent:', body);
      return res.status(200).json({ success: true });
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const User = await Users.findOne({
      where: { token },
    });
    if (!User) return res.status(404).json({ message: 'User not found!' });

    if (moment().diff(User.tokenCreatedAt, 'hours') <= 24) {
      User.token = jwt.sign(
        { user_id: User.id, email: User.email, role: User.role },
        process.env.SECRET,
      );
      User.tokenCreatedAt = moment();
      await User.save();

      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      User.password = newHashedPassword;
      User.save();
      return res.json({ success: true });
    }
    return res.status(403).json({ message: 'Token Timeout!' });
  } catch (error) {
    console.log(error);
  }
};

// const  = async (req, res) => {
//   try {
//     const { email, newEmail } = req.body;
//     const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//     if (!emailRegex.test(newEmail))
//       return res.status(403).json({ message: 'Invalid email format' });
//     const User = await Users.findOne({
//       where: { email },
//     });
//     if (!User) return res.status(404).json({ message: 'User not Found' });
//     User.email = newEmail;
//     User.save();

//     req.query.email = req.body.email;
//     const transporter = nodemailer.createTransport({
//       host: 'mail.privateemail.com',
//       port: 465,
//       secure: true,
//       service: 'privateemail',
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD,
//       },
//     });
//     const mailOptions = {
//       from: 'info@sisprogress.com',
//       to: newEmail,
//       subject: 'test',
//       html: `<!DOCTYPE html>
//       <html lang="en">
//         <head>
//           <meta charset="UTF-8" />
//           <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//           <title>Document</title>
//           <link
//             href="https://fonts.googleapis.com/css?family=Poppins"
//             rel="stylesheet"
//           />
//         </head>
//         <body>
//           <center>
//             <h1
//               style="
//                 font-style: normal;
//                 font-weight: 600;
//                 font-size: 32px;
//                 line-height: 48px;
//               "
//             >
//               Tesvan Platform
//               </h1>
//              <a href="http://localhost:3000/verify?token=${User.token}">http://localhost:3000/verify?token=${User.token}</a>
//         </body>
//       </html>
//       `,
//     };

//     transporter.sendMail(mailOptions);
//     return res.status(200).json({ success: true });
//   } catch (error) {
//     console.log(error);
//   }
// };

const changeUserData = async (req, res) => {
  try {
    const data = req.body;
    const { user_id } = req.user;
    console.log(user_id);

    if (!data) {
      return res.status(400).json({ message: 'Data is required.' });
    }

    if (typeof data !== 'object' || Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Invalid data format.' });
    }
    await Users.update(data, {
      where: { id: user_id },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const changeUserImage = async (req, res) => {
  try {
    const { file } = req.files;
    const { user_id } = req.user;
    const type = file.mimetype.split('/')[1];
    const fileName = v4() + '.' + type;
    file.mv(path.resolve(__dirname, '..', 'static', fileName));

    await Users.update({ image: fileName }, { where: { id: user_id } });
    return res.json({ url: fileName });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const authMe = async (req, res) => {
  try {
    
    const { user_id: id } = req.user;
    const User = await Users.findOne({
      where: { id },
      include: [
        {
          model: UserCourses,
          attributes: ['id'],
        },
      ],
    });
    if (!User) {
      return res.send({ succes: false });
    }
    const groupChats = await GroupChats.findAll({
      where: {
          members: {
              [Op.contains]: [id]
          }
      },
      attributes: ["id"]
  })
    User.setDataValue('groupChats', groupChats);
    await User.save()
    res.send(User);
  } catch (e) {
    res.status(500).json({ succes: false });
    console.log(e);
  }
};

const changeEmail = async (req, res) => {
  try {
    const { user_id: id } = req.user;

    const thisUser = await Users.findOne({ where: { id } });
    const { email } = req.body;
    if (thisUser.email === email) {
      return res.status(400).json({ succes: false });
    }
    const user = await Users.findOne({
      where: {
        email,
      },
    });
    await Email.destroy({ where: { newEmail: email } });

    if (user) {
      return res.status(409).json({ message: 'This Email already Used' });
    }

    await Email.create({
      userId: id,
      newEmail: email,
      newEmailVerification: false,
    });

    const data = {
      from: 'verification@tesvan.com',
      to: email,
      subject: 'Forgot Password Tesvan Platform',
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
          <link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet" />
        </head>
        <body>
          <center style="height:1000px;">
            <h1 style="font-style: normal; font-weight: 600; font-size: 32px; line-height: 48px;">New Email Verification Tesvan Platform</h1>

            <img src='https://platform.tesvan.com/server/forgotPassword.png' alt="" style="width:185px;" />
            
            <div style="width: 70%">
              <h1 style="font-style: normal; font-weight: 600; font-size: 32px; line-height: 48px;">Please verify your new email address.</h1>
              <p style="font-style: normal; font-size: 20px; text-align: left;">In order to complete your registration and start preparing for college admissions, you'll need to verify your email address.</p>
              <p style="font-style: normal; font-size: 20px; text-align: left;">You've entered ${email} as the email address for your account. Please verify this email address by clicking the button below.</p>
              <a href="https://platform.tesvan.com/settingsVerify?token=${thisUser.token}" style="text-decoration:none">
                <div style="width: 130px; height: 40px; background: #FFC038; border-radius: 5px; border:none; font-style: normal; font-weight: 500; font-size: 18px; line-height: 27px; color: #143E59; cursor:pointer; padding:7px; box-sizing:border-box;">Verify new email</div>
              </a>
            </div>
            <div style="width: 70%; margin-top: 30px; border-top: 1px solid #d4d4d4; border-bottom: 1px solid #d4d4d4;">
              <p style="font-size: 20px; line-height: 30px;text-align:left;">If the button is not working, please use the link below:
                <a href="https://platform.tesvan.com/settingsVerify?token=${thisUser.token}" style="color: #425dac; text-align:left; font-size:18px;">https://platform.tesvan.com/settingsVerify?token=${thisUser.token}</a>
              </p>
            </div>
            <div style="width: 70%; margin-top: 25px; margin-bottom: 25px; border-top: 1px solid #d4d4d4; border-bottom: 1px solid #d4d4d4;">
              <p style="display:flex; font-weight: 500; font-size: 18px; line-height: 27px; color: #646464; text-align: left;">Regards,</p>
              <div style="display:flex;">
                <img src="https://platform.tesvan.com/server/Frame.png" alt="" width="50px" />
              </div>
              <p style="display:flex; font-weight: 500; font-size: 18px; line-height: 27px; color: #646464; text-align: left;"></p>
            </div>
            <div style="width:70%">
              <p style="font-style: normal; font-weight: 500; font-size: 18px; line-height: 27px; color: #646464; text-align: center; margin-top:15px;">© 2024 Tesvan, All rights reserved</p>
            </div>
          </center>
          <style>
            * { color:black; }
            div { display: flex; flex-direction: column; justify-content: center; align-items: center; }
            p { text-align: left; }
            a { color: unset; }
          </style>
        </body>
      </html>`,
    };

    mg.messages().send(data, (error, body) => {
      if (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Failed to send email' });
      }
      console.log('Email sent:', body);
      return res.status(200).json({ success: true });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong .' });
  }
};

const verifyChangeEmail = async (req, res) => {
  try {
    const { user_id: id } = req.user;

    const User = await Users.findByPk(id);

    const { newEmail } = await Email.findOne({ where: { userId: id } });

    //  await Users.update({
    User.email = newEmail;
    User.save();
    await Email.destroy({ where: { newEmail } });

    // });
    if (User.save()) {
      await Email.destroy({ where: { userId: id } });
      return res.status(200).json({ success: true,role:User.role });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong .' });
  }
};
module.exports = {
  LoginUsers,
  sendEmailForForgotPassword,
  forgotPassword,
  changeEmail,
  authMe,
  changeUserData,
  changeUserImage,
  verifyChangeEmail,
};
