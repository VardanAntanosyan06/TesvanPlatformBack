const {
  Users,
  Groups,
  UserStatus,
  ChatMessages,
  UserLesson,
  UserHomework,
  UserPoints,
  UserCourses,
} = require('../models');
const { sequelize } = require('../models');
const Sequelize = require('sequelize')


const moment = require('moment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { v4 } = require('uuid');
require('dotenv').config();
const { Op } = require('sequelize');
const { group } = require('console');
const { image } = require('pdfkit');
const BCRYPT_HASH_SALT = 10;
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

// const createAdmin = async (req, res) => {
//   try {
//     const { user_id: userId } = req.user;
//     const { firstName, lastName, email, phoneNumber, birthday, gender, city, country } = req.body;

//     // if (!["ADMIN"].includes(role)) {
//     //   return res.status(401).json({ message: "You don't have access" });
//     // };
//     console.log(email, 888);


//     const hashPassword = await bcrypt.hash(v4(), BCRYPT_HASH_SALT);

//     const User = await Users.create({
//       role: "ADMIN",
//       firstName,
//       lastName,
//       email: email.toLowerCase(),
//       phoneNumber,
//       birthday,
//       gender,
//       password: hashPassword,
//       isVerified: true,
//       country,
//       city,
//       education: '',
//       backgroundInQA: 'true',
//       tokenCreatedAt: new Date().toISOString(),
//       creatorId: userId
//     });

//     const oneMonthInSeconds = 30 * 24 * 60 * 60;

//     User.token = jwt.sign(
//       { user_id: User.id, email: User.email, role: User.role, isActive: false },
//       process.env.SECRET,
//       { expiresIn: oneMonthInSeconds }
//     );
//     User.tokenCreatedAt = moment();
//     await User.save();

//     // Initialize Mailgun client
//     const data = {
//       from: 'verification@tesvan.com',
//       to: email.toLowerCase(),
//       subject: 'Forgot Password Tesvan Platform',
//       html: `<!DOCTYPE html>
//         <html lang="en">
//           <head>
//                   <meta charset="UTF-8" />
//                   <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//                   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//                   <title>Forgot Password</title>
//                   <link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet" />
//                 </head>
//           <body>
//             <center style="height:1000px;">
//               <h1 style="font-style: normal; font-weight: 600; font-size: 32px; line-height: 48px;">Generate new password Tesvan Platform</h1>

//               <img src='https://platform.tesvan.com/server/forgotPassword.png' alt="" style="width:185px;" />

//               <div style="width: 70%">
//                 <h1 style="font-style: normal; font-weight: 600; font-size: 32px; line-height: 48px;">Please verify your email address.</h1>
//                 <p style="font-style: normal; font-size: 20px; text-align: left;">In order to complete your registration and start preparing for college admissions, you'll need to verify your email address.</p>
//                 <p style="font-style: normal; font-size: 20px; text-align: left;">You've entered ${email.toLowerCase()} as the email address for your account. Please verify this email address by clicking the button below.</p>
//                 <a href="http://platform.tesvan.com/changePassword?token=${User.token}" style="text-decoration:none">
//                   <div style="width: 130px; height: 40px; background: #FFC038; border-radius: 5px; border:none; font-style: normal; font-weight: 500; font-size: 18px; line-height: 27px; color: #143E59; cursor:pointer; padding:7px; box-sizing:border-box;">Create password</div>
//                 </a>
//               </div>
//               <div style="width: 70%; margin-top: 30px; border-top: 1px solid #d4d4d4; border-bottom: 1px solid #d4d4d4;">
//                 <p style="font-size: 20px; line-height: 30px;text-align:left;">If the button is not working, please use the link below:
//                   <a href="http://platform.tesvan.com/changePassword?token=${User.token}" style="color: #425dac; text-align:left; font-size:18px;">https://platform.tesvan.com/verify?token=${User.token}</a>
//                 </p>
//               </div>
//               <div style="width: 70%; margin-top: 25px; margin-bottom: 25px; border-top: 1px solid #d4d4d4; border-bottom: 1px solid #d4d4d4;">
//                 <p style="display:flex; font-weight: 500; font-size: 18px; line-height: 27px; color: #646464; text-align: left;">Regards,</p>
//                 <div style="display:flex;">
//                   <img src="https://platform.tesvan.com/server/Frame.png" alt="" width="50px" />
//                 </div>
//                 <p style="display:flex; font-weight: 500; font-size: 18px; line-height: 27px; color: #646464; text-align: left;"></p>
//               </div>
//               <div style="width:70%">
//                 <p style="font-style: normal; font-weight: 500; font-size: 18px; line-height: 27px; color: #646464; text-align: center; margin-top:15px;">© 2024 Tesvan, All rights reserved</p>
//               </div>
//             </center>
//             <style>
//               * { color:black; }
//               div { display: flex; flex-direction: column; justify-content: center; align-items: center; }
//               p { text-align: left; }
//               a { color: unset; }
//             </style>
//           </body>
//         </html>`,
//     };

//     mailgun.messages().send(data, (error, body) => {
//       if (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ message: 'Failed to send email' });
//       }
//       console.log('Email sent:', body);
//       return res.status(200).json({ success: true });
//     });

//     res.status(200).json({ success: true, User })
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: 'Something went wrong.' });
//   }
// };

const createAdmin = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { firstName, lastName, email, phoneNumber, birthday, gender, city, country } = req.body;

    const hashPassword = await bcrypt.hash(v4(), BCRYPT_HASH_SALT);

    const adminMail = await Users.findOne({
      where: {
        email: email.toLowerCase()
      }
    });

    if (adminMail) {
      return res.status(400).json({ success: false, message: 'Mail already registered' });
    };

    const User = await Users.create({
      role: "ADMIN",
      firstName,
      lastName,
      email: email.toLowerCase(),
      phoneNumber,
      birthday,
      gender,
      password: hashPassword,
      isVerified: true,
      country,
      city,
      education: '',
      backgroundInQA: 'true',
      tokenCreatedAt: new Date().toISOString(),
      creatorId: userId
    });

    await UserStatus.create({
      userId: User.id,
      isActive: false,
      endDate: new Date().toISOString()
    })

    const oneMonthInSeconds = 30 * 24 * 60 * 60;

    User.token = jwt.sign(
      { user_id: User.id, email: User.email, role: User.role, isActive: false },
      process.env.SECRET,
      { expiresIn: oneMonthInSeconds }
    );

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
                  <title>Forgot Password</title>
                  <link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet" />
                </head>
          <body>
            <center style="height:1000px;">
              <h1 style="font-style: normal; font-weight: 600; font-size: 32px; line-height: 48px;">Generate new password Tesvan Platform</h1>
  
              <img src='https://platform.tesvan.com/server/forgotPassword.png' alt="" style="width:185px;" />
              
              <div style="width: 70%">
                <h1 style="font-style: normal; font-weight: 600; font-size: 32px; line-height: 48px;">Please verify your email address.</h1>
                <p style="font-style: normal; font-size: 20px; text-align: left;">In order to complete your registration and start preparing for college admissions, you'll need to verify your email address.</p>
                <p style="font-style: normal; font-size: 20px; text-align: left;">You've entered ${email.toLowerCase()} as the email address for your account. Please verify this email address by clicking the button below.</p>
                <a href="http://platform.tesvan.com/changePassword?token=${User.token}" style="text-decoration:none">
                  <div style="width: 130px; height: 40px; background: #FFC038; border-radius: 5px; border:none; font-style: normal; font-weight: 500; font-size: 18px; line-height: 27px; color: #143E59; cursor:pointer; padding:7px; box-sizing:border-box;">Create password</div>
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

    mailgun.messages().send(data, (error, body) => {
      if (error) {
        console.error('Error:', error);
        if (!res.headersSent) {
          return res.status(500).json({ message: 'Failed to send email' });
        }
      } else {
        console.log('Email sent:', body);
        if (!res.headersSent) {
          return res.status(200).json({ success: true, User });
        }
      }
    });

  } catch (error) {
    console.log(error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Something went wrong.' });
    }
  }
};


const getAdmins = async (req, res) => {
  try {
    const { user_id: userId } = req.user;

    let admins = await Users.findAll({
      where: {
        creatorId: userId,
        role: "ADMIN"
      },
      include: [
        {
          model: Users,
          as: "teachers",
          where: {
            role: "TEACHER"
          },
          attributes: ["id", "creatorId"],
          required: false
        },
        {
          model: UserStatus,
          as: "userStatus",
          attributes: ["isActive"],
        }
      ],
      attributes: ["id", 'firstName', 'lastName', 'image', 'role'],
    });

    const adminIds = Array.from(
      new Set(admins.map(value => value.id))
    );

    const teachers = await Users.findAll({
      where: {
        creatorId: adminIds,
        role: "TEACHER"
      },
      include: [
        {
          model: Groups,
          as: 'teacherGroups',
          include: [
            {
              model: Users,
              where: { role: 'STUDENT' },
              attributes: ["id"],
              required: false
            },
          ],
          attributes: ["id"]
        }
      ],
      attributes: ["id", "creatorId"]
    })

    const adminDate = teachers.reduce((aggr, value) => {
      if (!aggr[value.creatorId]) {
        const uniqueGroups = Array.from(
          new Map(value.teacherGroups.map(e => [e.id, { id: e.id, users: e.Users.length }])).values()
        )
        aggr[value.creatorId] = uniqueGroups
      }
      else {
        const existingGroups = new Map(
          aggr[value.creatorId].map(e => [e.id, e])
        );
        value.teacherGroups.forEach(e => {
          existingGroups.set(e.id, { id: e.id, users: e.Users.length });
        });
        aggr[value.creatorId] = Array.from(existingGroups.values());
      }
      return aggr
    }, {})

    const resAdminDate = admins.reduce((aggr, value) => {
      aggr.push({
        id: value.id,
        firstName: value.firstName,
        lastName: value.lastName,
        image: value.image,
        teacherCount: value.teachers?.length || 0,
        groupCount: adminDate[value.id]?.length || 0,
        userCount: adminDate[value.id]?.reduce((aggr, e) => { return aggr + +e.users }, 0) || 0,
        isActive: value.userStatus.isActive
      })
      return aggr
    }, [])

    return res.status(200).json({
      success: true,
      admins: resAdminDate,
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(+id)) {
      return res.status(400).json({ success: false, message: "Invalid ID. Must be a number." });
    }

    const admin = await Users.findOne({
      where: { id: +id, role: "ADMIN" },
      attributes: { exclude: ["password", "token", "isVerified", "role", "likedCourses", "tokenCreatedAt"] }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      })
    };

    return res.status(200).json({
      success: true,
      admin
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber, birthday, gender, city, country } = req.body;

    if (isNaN(+id)) {
      return res.status(400).json({ success: false, message: "Invalid ID. Must be a number." });
    };

    const updateDate = {
      firstName,
      lastName,
      email,
      phoneNumber,
      birthday,
      gender,
      city,
      country
    };

    const [update] = await Users.update(
      updateDate,
      {
        where: { id: +id }
      }
    );

    if (update === 0) {
      return res.status(204).json({ success: true, message: 'Nothing has changed' });
    };

    return res.status(200).json({
      success: true,
      message: "Admin updated"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(+id)) {
      return res.status(400).json({ success: false, message: "Invalid ID. Must be a number." });
    }

    const teachers = await Users.findAll({
      where: {
        creatorId: id,
        role: "TEACHER"
      },
      attributes: ["id", "creatorId"]
    });

    const teacherIds = teachers.map(teacher => teacher.id);

    const transaction = await sequelize.transaction();
    try {

      await UserPoints.destroy({
        where: { userId: [+id, ...teacherIds] },
        transaction
      });

      await UserHomework.destroy({
        where: { UserId: [+id, ...teacherIds] },
        transaction
      });

      await UserLesson.destroy({
        where: { UserId: [+id, ...teacherIds] },
        transaction
      });

      await UserCourses.destroy({
        where: { UserId: [+id, ...teacherIds] },
        transaction
      });

      await ChatMessages.destroy({
        where: {
          [Op.or]: [{ senderId: [+id, ...teacherIds] }, { receiverId: [+id, ...teacherIds] }]
        },
        transaction
      });

      const deleteAdmin = await Users.destroy({
        where: { id: [+id, ...teacherIds] },
        transaction
      });

      if (deleteAdmin === 0) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: "No admin found to delete." });
      }

      // Commit the transaction
      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Admin deleted successfully."
      });

    } catch (error) {
      // Rollback transaction if any error occurs
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ message: 'Something went wrong while deleting the admin.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

module.exports = {
  createAdmin,
  getAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin
}