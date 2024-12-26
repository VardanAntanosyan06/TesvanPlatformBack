const { Users, UserCourses, Email, GroupChats, UserStatus, Payment } = require('../models');
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


//checking payment date for Admin Teacher
function paymentIsActive(payment) {
  function isOneYearPassed(updatedAt) {
    // Add one year to the updatedAt date
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() - 1);

    // Compare with the current date
    return new Date(updatedAt) >= oneYearLater;
  };

  function isOneMonthPassed(updatedAt) {
    // Add one month to the updatedAt date
    // const oneMonthLater = new Date("2026-02-30 10:00:00.765+00");
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() - 1);
    // Compare with the current date
    return new Date(updatedAt) >= oneMonthLater;
  }

  function dateDifferenceInDays(date1, date2) {
    const diffInTime = date1.getTime() - date2.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24); // Convert milliseconds to days
    return diffInDays;
  }

  if (payment.length === 0) {
    return false
  } else if (payment.length === 1) {
    if (payment[0].type === "unlimit") {
      return true
    } else if (payment[0].type === "full") {
      return isOneYearPassed(payment[0].updatedAt)
    } else if (payment[0].type === "monthly") {
      return isOneMonthPassed(payment[0].updatedAt)
    };
  } else if (payment[0].type === "unlimit") {
    return true
  } else if (payment[0].type === "monthly") {
    if (payment[1].type === "monthly") {
      const daysOlder = dateDifferenceInDays(payment[0].updatedAt, payment[1].updatedAt)
      if (daysOlder >= 30) {
        return isOneMonthPassed(payment[0].updatedAt)
      } else {
        const paymentDate = new Date(payment[0].updatedAt);
        paymentDate.setDate(paymentDate.getDate() + (30 - daysOlder));
        return isOneMonthPassed(paymentDate);
      }
    } else if (payment[1].type === "full") {
      const daysOlder = dateDifferenceInDays(payment[0].updatedAt, payment[1].updatedAt)
      if (daysOlder >= 365) {
        return isOneMonthPassed(payment[0].updatedAt)
      } else {
        const paymentDate = new Date(payment[0].updatedAt);
        paymentDate.setDate(paymentDate.getDate() + (365 - daysOlder));
        return isOneMonthPassed(paymentDate);
      }
    };
  } else if (payment[0].type === "full") {
    if (payment[1].type === "monthly") {
      const daysOlder = dateDifferenceInDays(payment[0].updatedAt, payment[1].updatedAt)
      if (daysOlder >= 30) {
        return isOneYearPassed(payment[0].updatedAt);
      } else {
        const paymentDate = new Date(payment[0].updatedAt);
        paymentDate.setDate(paymentDate.getDate() + (30 - daysOlder));
        return isOneYearPassed(paymentDate);
      };
    } else if (payment[1].type === "full") {
      const daysOlder = dateDifferenceInDays(payment[0].updatedAt, payment[1].updatedAt)
      if (daysOlder >= 365) {
        return isOneYearPassed(payment[0].updatedAt);
      } else {
        const paymentDate = new Date(payment[0].updatedAt);
        paymentDate.setDate(paymentDate.getDate() + (365 - daysOlder));
        return isOneYearPassed(payment[0].updatedAt);
      }
    }
  } else {
    return false
  };
}

const LoginUsers = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userEmail = email.toLowerCase()

    const User = await Users.findOne({
      where: { email: userEmail },
      include: [
        {
          model: UserCourses,
          attributes: ['id'],
        },
        {
          model: UserStatus,
          as: "userStatus",
          attributes: ["isActive"],
        }
      ],
    });

    if (User && !User.isVerified) {
      return res.status(401).json({ isVerified: false });
    }

    if (User && User.isVerified && (await bcrypt.compare(password, User.password))) {
      const groupChats = await GroupChats.findAll({
        where: {
          members: {
            [Op.contains]: [User.id],
          },
        },
        attributes: ['id', 'name', 'image'],
      });
      User.setDataValue('groupChats', groupChats);

      if (User.role === "ADMIN") {
        const payment = await Payment.findAll({
          where: {
            adminId: User.creatorId,
            userId: User.id,
            status: "Success"
          },
          order: [["id", "DESC"]]
        });
        const isActive = paymentIsActive(payment)
        User.userStatus.isActive = isActive
        UserStatus.update(
          {
            isActive
          },
          {
            where: {
              userId: User.id
            }
          }
        )
      } else if (User.role === "TEACHER") {
        const admin = await Users.findOne({
          where: { id: User.creatorId },
        });
        const payment = await Payment.findAll({
          where: {
            adminId: admin.creatorId,
            userId: admin.id,
            status: "Success"
          },
          order: [["id", "DESC"]]
        });
        const isActive = paymentIsActive(payment)
        User.userStatus.isActive = isActive
        console.log(isActive, 44);

        UserStatus.update(
          {
            isActive
          },
          {
            where: {
              userId: User.id
            }
          }
        )
      } else if (User.role === "SUPERADMIN") {
        async function payment(admin) {
          const payment = await Payment.findAll({
            where: {
              adminId: User.id,
              userId: admin.id,
              status: "Success"
            },
            order: [["id", "DESC"]]
          });
          const isActive = paymentIsActive(payment)
          User.userStatus.isActive = isActive
          await UserStatus.update(
            {
              isActive
            },
            {
              where: {
                userId: admin.id
              }
            }
          )
        };

        const admins = await Users.findAll({
          where: {
            creatorId: User.id,
            role: "ADMIN"
          },
          attributes: ["id", 'firstName', 'lastName', 'image', 'role'],
        });

        admins.forEach(async element => {
          payment(element)
        });
      };


      const oneMonthInSeconds = 30 * 24 * 60 * 60;
      User.token = jwt.sign(
        { user_id: User.id, email: User.email, role: User.role, isActive: User.userStatus?.isActive },
        process.env.SECRET,
        {
          expiresIn: oneMonthInSeconds // Sets expiration to 1 month
        }
      );
      User.tokenCreatedAt = moment();
      await User.save()
      const { password, ...sendData } = User.dataValues;
      return res.status(200).json({ User: sendData });
    }
    return res.status(403).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.log(error);
  }
};

const sendEmailForForgotPassword = async (req, res) => {
  try {
    const { email } = req.query;
    const userEmail = email.toLowerCase()

    const User = await Users.findOne({ where: { email: userEmail } });
    if (!User || (User && !User.isVerified))
      return res.status(403).json({ message: 'There is not verified user' });

    User.token = jwt.sign({ user_id: User.id, email: User.email, role: User.role }, process.env.SECRET);
    User.tokenCreatedAt = moment();
    await User.save();

    // Initialize Mailgun client

    const data = {
      from: 'verification@tesvan.com',
      to: email.toLowerCase(),
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
              <p style="font-style: normal; font-size: 20px; text-align: left;">You've entered ${email.toLowerCase()}. as the email address for your account. Please verify this email address by clicking the button below.</p>
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
        {
          model: UserStatus,
          as: "userStatus",
          attributes: ["isActive"],
        }
      ],
      attributes: ["id", "firstName", "lastName", "image", "email", "role", "creatorId"]
    });
    if (!User) {
      return res.send({ succes: false });
    }
    const groupChats = await GroupChats.findAll({
      where: {
        members: {
          [Op.contains]: [id],
        },
      },
      attributes: ["id", "name", "image"]
    })
    User.setDataValue('groupChats', groupChats);
    await User.save();

    if (User.role === "ADMIN") {
      const payment = await Payment.findAll({
        where: {
          adminId: User.creatorId,
          userId: id,
          status: "Success"
        },
        order: [["id", "DESC"]]
      });
      const isActive = paymentIsActive(payment)
      User.userStatus.isActive = isActive
      UserStatus.update(
        {
          isActive
        },
        {
          where: {
            userId: id
          }
        }
      )
    } else if (User.role === "TEACHER") {
      const admin = await Users.findOne({
        where: { id: User.creatorId },
      });
      const payment = await Payment.findAll({
        where: {
          adminId: admin.creatorId,
          userId: admin.id,
          status: "Success"
        },
        order: [["id", "DESC"]]
      });
      const isActive = paymentIsActive(payment)
      User.userStatus.isActive = isActive
      UserStatus.update(
        {
          isActive
        },
        {
          where: {
            userId: id
          }
        }
      )
    } else if (User.role === "SUPERADMIN") {
      async function payment(admin) {
        const payment = await Payment.findAll({
          where: {
            adminId: id,
            userId: admin.id,
            status: "Success"
          },
          order: [["id", "DESC"]]
        });
        const isActive = paymentIsActive(payment)
        User.userStatus.isActive = isActive
        UserStatus.update(
          {
            isActive
          },
          {
            where: {
              userId: admin.id
            }
          }
        )
      };

      const admins = await Users.findAll({
        where: {
          creatorId: id,
          role: "ADMIN"
        },
        attributes: ["id", 'firstName', 'lastName', 'image', 'role'],
      });

      admins.forEach(async element => {
        payment(element)
      });


    };

    const oneMonthInSeconds = 30 * 24 * 60 * 60;
    User.token = jwt.sign(
      { user_id: User.id, email: User.email, role: User.role, isActive: User.userStatus?.isActive },
      process.env.SECRET,
      {
        expiresIn: oneMonthInSeconds // Sets expiration to 1 month
      }
    );
    User.tokenCreatedAt = moment();
    await User.save()

    res.json({ User });
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

    if (thisUser.email === email.toLowerCase()) {
      return res.status(400).json({ succes: false });
    }
    const user = await Users.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
    await Email.destroy({ where: { newEmail: email.toLowerCase() } });

    if (user) {
      return res.status(409).json({ message: 'This Email already Used' });
    }

    await Email.create({
      userId: id,
      newEmail: email.toLowerCase(),
      newEmailVerification: false,
    });

    const data = {
      from: 'verification@tesvan.com',
      to: email.toLowerCase(),
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
              <p style="font-style: normal; font-size: 20px; text-align: left;">You've entered ${email.toLowerCase()} as the email address for your account. Please verify this email address by clicking the button below.</p>
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

    User.email = newEmail;
    User.save();
    await Email.destroy({ where: { newEmail } });

    if (User.save()) {
      await Email.destroy({ where: { userId: id } });
      return res.status(200).json({ success: true, role: User.role });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong .' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { user_id: id } = req.user;
    const { password } = req.body;
    const thisUser = await Users.findOne({ where: { id } });
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*+.-])(?=\S{10,}$).*/;

    if (regex.test(password)) {
      const hashedPassword = await bcrypt.hash(password, 10);
      thisUser.password = hashedPassword;

      thisUser.token = jwt.sign(
        { user_id: id, email: thisUser.email, role: thisUser.role },
        process.env.SECRET,
      );
      thisUser.save();
    } else {
      return res.status(403).json({ success: false, message: 'Password is uncorrect' });
    }

    return res.status(200).json({ succes: true });
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
  changePassword,
};
