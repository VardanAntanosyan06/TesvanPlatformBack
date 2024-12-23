const {
  Users,
  GroupsPerUsers,
  Certificates,
  Calendar,
  Chats,
  GroupCourses,
  UserTests,
  UserAnswersTests,
  UserAnswersQuizz,
  Message,
  UserCourses,
  UserHomework,
  UserLesson,
} = require('../models');
const moment = require('moment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
const { v4 } = require('uuid');
const { where } = require('sequelize');
require('dotenv').config();
const { Op } = require('sequelize');
const BCRYPT_HASH_SALT = 10;
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const UserRegistartion = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      birthday,
      gender,
      country,
      city,
      englishLevel,
      education,
      backgroundInQA,
      password,
    } = req.body;
    const userEmail = email.toLowerCase()
    const isUser = await Users.findOne({ where: { email: userEmail, isVerified: true } });
    if (isUser) return res.status(403).json({ message: 'Email must be unique.' });
    const hashedPassword = await bcrypt.hash(password, BCRYPT_HASH_SALT);

    const newUser = await Users.create({
      firstName,
      lastName,
      email: userEmail,
      phoneNumber,
      birthday,
      gender,
      country,
      city,
      englishLevel,
      education,
      backgroundInQA,
      password: hashedPassword,
      tokenCreatedAt: moment(),
      role: 'STUDENT',
    });
    newUser.token = jwt.sign({ user_id: newUser.id, email: newUser.email, role: newUser.role }, process.env.SECRET);
    await newUser.save();
    return res.status(200).json({ succes: true, token: newUser.token });
  } catch (error) {
    console.log(error.message);
    if (error.name == 'SequelizeValidationError') {
      console.log(1);

      return res.status(403).json({ message: error.message });
    } else {
      console.log(2);

      return res.status(500).json({ message: 'Something went wrong.' });
    }
  }
};

const UserRegistartionSendEmail = async (req, res) => {
  try {
    let { email } = req.query;
    const userEmail = email.toLowerCase()

    const User = await Users.findOne({
      where: { email: userEmail },
    });
    if (!User || User.isVerified)
      return res.status(404).json({ message: 'There is not unverified user!' });
    User.token = jwt.sign({ user_id: User.id, email: User.email, role: User.role }, process.env.SECRET);
    User.tokenCreatedAt = moment();
    await User.save();

    (function () {
      const data = {
        from: 'verification@tesvan.com',
        to: userEmail,
        subject: 'Verify your email address',
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
              <h1 style="font-style: normal; font-weight: 600; font-size: 32px; line-height: 48px;">Welcome to Tesvan Platform</h1>
  
              <img src='https://platform.tesvan.com/server/messageIcon.png' alt="" style="width:185px;" />
              
              <div style="width: 70%">
                <h1 style="font-style: normal; font-weight: 600; font-size: 32px; line-height: 48px;">Please verify your email address.</h1>
                <p style="font-style: normal; font-size: 20px; text-align: left;">“In order to complete your registration and start your learning journey, please verify your email address.</p>
                <p style="font-style: normal; font-size: 20px; text-align: left;">You've entered ${User.email} as the email address for your account. Please verify this email address by clicking the button below.</p>
                <a href="https://platform.tesvan.com/verify?token=${User.token}" style="text-decoration:none">
                  <div style="width: 130px; height: 40px; background: #FFC038; border-radius: 5px; border:none; font-style: normal; font-weight: 500; font-size: 18px; line-height: 27px; color: #143E59; cursor:pointer; padding:7px; box-sizing:border-box;">Verify</div>
                </a>
              </div>
              <div style="width: 70%; margin-top: 30px; border-top: 1px solid #d4d4d4; border-bottom: 1px solid #d4d4d4;">
                <p style="font-size: 20px; line-height: 30px;text-align:left;">If the button is not working, please use the link below:
                  <a href="https://platform.tesvan.com/verify?token=${User.token}" style="color: #425dac; text-align:left; font-size:18px;">https://platform.tesvan.com/verify?token=${User.token}</a>
                </p>
              </div>
              <div style="width: 70%; margin-top: 25px; margin-bottom: 25px; border-top: 1px solid #d4d4d4; border-bottom: 1px solid #d4d4d4;">
                <p style="display:flex; font-weight: 500; font-size: 18px; line-height: 27px; color: #646464; text-align: left;">Regards,</p>
                <div style="display:flex;">
                  <img src="https://platform.tesvan.com/server/Frame.png" alt="" width="50px" />`,
      };

      mailgun.messages().send(data, (error, body) => {
        if (error) console.log(error);
        else console.log(body);
      });
    })();

    return res.status(200).json({ success: true, token: User.token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const EmailExist = async (req, res) => {
  try {
    const { email } = req.params;
    const userEmail = email.toLowerCase()

    const user = await Users.findOne({ where: { email: userEmail, isVerified: true } });

    if (user)
      return res.status(403).json({
        success: false,
        message: 'This email address is already used',
      });
    const userNotVerified = Users.findOne({ where: { email: userEmail, isVerified: false } })
    if (userNotVerified) {
      await Users.destroy({ where: { email: userEmail, isVerified: false } })
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const UserRegistartionVerification = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(403).json("token can't be empty");
    const User = await Users.findOne({
      where: { token },
    });
    if (!User) return res.status(404).json({ message: 'User not found!' });
    if (moment().diff(User.tokenCreatedAt, 'hours') <= 24) {
      User.isVerified = true;
      User.token = jwt.sign(
        { user_id: User.id, email: User.email, role: User.role },
        process.env.SECRET,
      );
      User.tokenCreatedAt = moment();
      await User.save();

      return res.status(200).json({ success: true });
    }
    return res.status(403).json({ message: 'token timeout!' });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};
const AddMember = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { role, firstName, lastName, email, phoneNumber, birthday, gender, city, country } = req.body;

    if (!["STUDENT", "TEACHER"].includes(role)) {
      return res.status(401).json({ message: "You don't have access" });
    };

    const hashPassword = await bcrypt.hash(v4(), BCRYPT_HASH_SALT);

    const User = await Users.create({
      role,
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

  } catch (error) {
    console.error(error);
    if (
      error.name === 'SequelizeValidationError' ||
      error.name === 'RangeError' ||
      error.name == 'SequelizeUniqueConstraintError'
    ) {
      return res.status(403).json({ message: error.message });
    } else {
      return res.status(500).json({ message: 'Something went wrong.' });
    }
  }
};

const getMembers = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { userName, order = "DESC" } = req.query;
    const searchTerms = userName ? userName.trim().split(" ") : [];

    const teachers = await Users.findAll({
      where: {
        creatorId: userId,
        role: 'TEACHER',
      },
      order: [['id', 'DESC']],
    });

    const teacherIds = teachers.reduce((aggr, value) => {
      aggr.push(value.id)
      return aggr;
    }, [])

    const whereCondition = searchTerms.length
      ? {
        role: 'STUDENT',
        [Op.or]: [
          // Single search term: match either first or last name
          ...(searchTerms.length === 1
            ? [
              { firstName: { [Op.iLike]: `%${searchTerms[0]}%` } },
              { lastName: { [Op.iLike]: `%${searchTerms[0]}%` } }
            ]
            : [
              // Two terms: assume firstName and lastName separately
              {
                [Op.and]: [
                  { firstName: { [Op.iLike]: `%${searchTerms[0]}%` } },
                  { lastName: { [Op.iLike]: `%${searchTerms[1]}%` } }
                ]
              },
              // Try the reverse case in case they typed last name first
              {
                [Op.and]: [
                  { firstName: { [Op.iLike]: `%${searchTerms[1]}%` } },
                  { lastName: { [Op.iLike]: `%${searchTerms[0]}%` } }
                ]
              }
            ])
        ]
      }
      : {
        role: 'STUDENT',
      };

    const groupCoursUsers = await GroupCourses.findAll({
      where: {
        creatorId: [...teacherIds, userId]
      },
      include: {
        model: Users,
        as: 'courses',
        where: whereCondition,
        attributes: ["id", "firstName", "lastName", "image", "role", "createdAt"]
      }
    });

    const students = groupCoursUsers.reduce((aggr, value) => {
      aggr = [...aggr, ...value.courses]
      return aggr
    }, [])

    // Make objects unique based on the 'id' property
    const uniqueStudents = Array.from(
      new Map(students.map((obj) => [obj.id, obj])).values()
    );

    const members = {
      teachers,
      students: uniqueStudents,
    };
    res.send(members);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getMembersSuperAdmin = async (req, res) => {

  try {
    const { userName, order = "DESC" } = req.query;
    const searchTerms = userName ? userName.trim().split(" ") : [];
    const whereCondition = searchTerms.length
      ? {
        role: 'STUDENT',
        [Op.or]: [
          // Single search term: match either first or last name
          ...(searchTerms.length === 1
            ? [
              { firstName: { [Op.iLike]: `%${searchTerms[0]}%` } },
              { lastName: { [Op.iLike]: `%${searchTerms[0]}%` } }
            ]
            : [
              // Two terms: assume firstName and lastName separately
              {
                [Op.and]: [
                  { firstName: { [Op.iLike]: `%${searchTerms[0]}%` } },
                  { lastName: { [Op.iLike]: `%${searchTerms[1]}%` } }
                ]
              },
              // Try the reverse case in case they typed last name first
              {
                [Op.and]: [
                  { firstName: { [Op.iLike]: `%${searchTerms[1]}%` } },
                  { lastName: { [Op.iLike]: `%${searchTerms[0]}%` } }
                ]
              }
            ])
        ]
      }
      : {
        role: 'STUDENT',
      };
    const teachers = await Users.findAll({
      where: {
        role: 'TEACHER',
      },
      order: [['id', 'DESC']],
    });
    const students = await Users.findAll({
      where: whereCondition,
      order: [['id', 'DESC']],
    });
    const members = {
      teachers,
      students,
    };
    res.send(members);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getMember = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Users.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ['token', 'tokenCreatedAt', 'likedCourses', 'createdAt', 'updatedAt', 'password'],
      },
    });

    if (!user)
      return res.json({
        succes: false,
        message: `with id ${id} user not found`,
      });
    return res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};
const editMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Users.findByPk(id);
    if (!member) {
      res.status(404).json({ success: false, message: 'No User Whith this Id' });
    }
    const {
      role,
      firstName,
      lastName,
      email,
      phoneNumber,
      birthday,
      gender,
      password,
      city,
      education,
      country,
    } = req.body;
    const hashPassword = await bcrypt.hash(password, BCRYPT_HASH_SALT);
    const isoDate = new Date(birthday).toISOString();

    member.role = role;
    member.firstName = firstName;
    member.lastName = lastName;
    member.email = email.toLowerCase();
    member.phoneNumber = phoneNumber;
    member.birthday = isoDate;
    member.gender = gender;
    member.password = hashPassword;
    member.country = country;
    member.city = city;
    member.education = education;
    await member.save();
    res.send(member);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteMembers = async (req, res) => {
  try {
    const { id } = req.params;

    await UserCourses.destroy({
      where: {
        UserId: id,
      },
    });
    await UserLesson.destroy({
      where: {
        UserId: id,
      },
    });

    await Users.destroy({
      where: {
        id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { user_id: id } = req.user;
    const { password } = req.query;
    const User = await Users.findByPk(id);
    if (User && User.isVerified && (await bcrypt.compare(password, User.password))) {

      await UserLesson.destroy({
        where: {
          UserId: id,
        },
      });

      await UserCourses.destroy({
        where: {
          UserId: id,
        },
      });

      await GroupsPerUsers.destroy({
        where: {
          userId: id
        }
      });

      await Chats.destroy({
        where: {
          [Op.or]: [{ firstId: id }, { secondId: id }],
        },
      });

      await UserAnswersQuizz.destroy({
        where: {
          userId: id
        }
      });

      await Users.destroy({
        where: {
          id,
        },
      });

      return res.json({ success: true });
    }
    return res.status(403).json({ success: false, message: 'Password is wrong' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const editImage = async (req, res) => {
  try {
    const { user_id: id } = req.user;
    const { image } = req.files;

    const user = await Users.findByPk(id);

    const imgType = image.mimetype.split('/')[1];
    const imageUrl = v4() + '.' + imgType;
    await image.mv(path.resolve(__dirname, '..', 'static', imageUrl));

    user.image = imageUrl;
    await user.save();

    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const RegisterTesting = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phoneNumber,
      birthday,
      gender,
      city,
      country,
      education,
      backgroundInQA,
    } = req.body;

    const hashPassword = await bcrypt.hash(password, BCRYPT_HASH_SALT);

    const User = await Users.create({
      role,
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
      education,
      backgroundInQA,
      tokenCreatedAt: new Date().toISOString(),
    });

    User.token = jwt.sign({ user_id: User.id, email: User.email, role: User.role }, process.env.SECRET);
    User.tokenCreatedAt = moment();
    await User.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.name);
    if (error.name == 'SequelizeValidationError') {
      return res.status(403).json({ message: error.message });
    } else if (error.name == 'SequelizeUniqueConstraintError') {
      return res.status(403).json({ message: error.message });
    } else {
      return res.status(500).json({ message: 'Something went wrong.' });
    }
  }
};

const changeEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const { user_id: userId } = req.user;

    const User = await Users.findOne({ where: { id: userId } });

    User.email = email.toLowerCase();
    User.token = jwt.sign({ user_id: User.id, email: User.email, role: User.role }, process.env.SECRET);
    User.tokenCreatedAt = moment();
    await User.save();

    (function () {
      const data = {
        from: 'verification@tesvan.com',
        to: email.toLowerCase(),
        subject: 'Verify your email address',
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
              <h1 style="font-style: normal; font-weight: 600; font-size: 32px; line-height: 48px;">Welcome to Tesvan Platform</h1>
  
              <img src='https://platform.tesvan.com/server/messageIcon.png' alt="" style="width:185px;" />
              
              <div style="width: 70%">
                <h1 style="font-style: normal; font-weight: 600; font-size: 32px; line-height: 48px;">Please verify your email address.</h1>
                <p style="font-style: normal; font-size: 20px; text-align: left;">“In order to complete your registration and start your learning journey, please verify your email address.</p>
                <p style="font-style: normal; font-size: 20px; text-align: left;">You've entered ${email.toLowerCase()} as the email address for your account. Please verify this email address by clicking the button below.</p>
                <a href="https://platform.tesvan.com/verify?token=${User.token}" style="text-decoration:none">
                  <div style="width: 130px; height: 40px; background: #FFC038; border-radius: 5px; border:none; font-style: normal; font-weight: 500; font-size: 18px; line-height: 27px; color: #143E59; cursor:pointer; padding:7px; box-sizing:border-box;">Verify</div>
                </a>
              </div>
              <div style="width: 70%; margin-top: 30px; border-top: 1px solid #d4d4d4; border-bottom: 1px solid #d4d4d4;">
                <p style="font-size: 20px; line-height: 30px;text-align:left;">If the button is not working, please use the link below:
                  <a href="https://platform.tesvan.com/verify?token=${User.token}" style="color: #425dac; text-align:left; font-size:18px;">https://platform.tesvan.com/verify?token=${User.token}</a>
                </p>
              </div>
              <div style="width: 70%; margin-top: 25px; margin-bottom: 25px; border-top: 1px solid #d4d4d4; border-bottom: 1px solid #d4d4d4;">
                <p style="display:flex; font-weight: 500; font-size: 18px; line-height: 27px; color: #646464; text-align: left;">Regards,</p>
                <div style="display:flex;">
                  <img src="https://platform.tesvan.com/server/Frame.png" alt="" width="50px" />`,
      };

      mailgun.messages().send(data, (error, body) => {
        if (error) console.log(error);
        else console.log(body);
      });
    })();

    return res.json({ success: true, token: User.token });
  } catch (error) {
    if (error.name == 'SequelizeValidationError') {
      return res.status(403).json({ message: error.message });
    } else if (error.name == 'SequelizeUniqueConstraintError') {
      return res.status(403).json({ message: error.message });
    } else {
      return res.status(500).json({ message: 'Something went wrong.' });
    }
  }
};



module.exports = {
  UserRegistartion,
  UserRegistartionSendEmail,
  UserRegistartionVerification,
  EmailExist,
  AddMember,
  getMembers,
  getMember,
  editMember,
  deleteAccount,
  deleteMembers,
  editImage,
  RegisterTesting,
  changeEmail,
};
