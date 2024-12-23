const {
  Users,
  Groups,
  GroupsPerUsers
} = require('../models');

const moment = require('moment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { v4 } = require('uuid');
require('dotenv').config();
const { Op } = require('sequelize');
const BCRYPT_HASH_SALT = 10;
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const createAdmin = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { firstName, lastName, email, phoneNumber, birthday, gender, city, country } = req.body;

    // if (!["ADMIN"].includes(role)) {
    //   return res.status(401).json({ message: "You don't have access" });
    // };

    const hashPassword = await bcrypt.hash(v4(), BCRYPT_HASH_SALT);

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
            <title>Document</title>
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
        return res.status(500).json({ message: 'Failed to send email' });
      }
      console.log('Email sent:', body);
      return res.status(200).json({ success: true });
    });

    res.status(200).json({ success: true, User })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getAdmins = async (req, res) => {
  try {
    const { user_id: userId } = req.user;

    const admins = await Users.findAll({
      where: {
        creatorId: userId,
        role: "ADMIN"
      },
      attributes: ["id"],
      include: [
        {
          model: Users,
          as: "teachers",
          where: {
            role: "TEACHER"
          },
          attributes: ["id"],
        }
      ]
    });

    const teacherdate = admins.reduce((aggr, value) => {
      aggr = [...aggr, ...value.teachers]
      return aggr;
    }, []);

    const teacherIds = Array.from(
      new Set(teacherdate.map(value => [value.id]))
    )

    const groups = await Groups.findAll({
      where: { creatorId: [...teacherIds, userId] },
      include: [
        {
          model: GroupsPerUsers,
          where: {
            userRole: "STUDENT"
          },
          attributes: ['id', 'userId'],
          include: {
            model: Users,
            attributes: ['id', 'firstName', 'lastName', 'role', 'image'],
          },
        },
      ],
    });


  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

module.exports = {
  createAdmin
}