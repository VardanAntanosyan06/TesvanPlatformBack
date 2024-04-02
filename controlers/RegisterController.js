const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const {
  Users,
  GroupsPerUsers,
  Certificates,
  Calendar,
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
require('dotenv').config();

const BCRYPT_HASH_SALT = 10;

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
      role,
    } = req.body;
    const isUser = await Users.findOne({ where: { email } });
    if (isUser) return res.status(403).json({ message: 'Email must be unique.' });
    const hashedPassword = await bcrypt.hash(password, BCRYPT_HASH_SALT);
    const User = await Users.create({
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
      password: hashedPassword,
      tokenCreatedAt: moment(),
      role,
    });
    User.token = jwt.sign({ user_id: User.id, email, role }, process.env.SECRET);
    await User.save();
    return res.status(200).json({ succes: true });
  } catch (error) {
    console.log(error.message);
    if (error.name == 'SequelizeValidationError') {
      return res.status(403).json({ message: error.message });
    } else {
      return res.status(500).json({ message: 'Something went wrong.' });
    }
  }
};

const UserRegistartionSendEmail = async (req, res) => {
  try {
    let { email } = req.query;

    const User = await Users.findOne({
      where: { email },
    });
    if (!User || User.isVerified)
      return res.status(404).json({ message: 'There is not unverified user!' });
    User.token = jwt.sign({ user_id: User.id, email, role: User.role }, process.env.SECRET);
    User.tokenCreatedAt = moment();
    await User.save();

    (function () {
      const data = {
        from: 'verification@tesvan.com',
        to: email,
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
                <p style="font-style: normal; font-size: 20px; text-align: left;">In order to complete your registration and start preparing for college admissions, you'll need to verify your email address.</p>
                <p style="font-style: normal; font-size: 20px; text-align: left;">You've entered ${email} as the email address for your account. Please verify this email address by clicking the button below.</p>
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

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const EmailExist = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await Users.findOne({ where: { email } });

    if (user)
      return res
        .status(403)
        .json({ success: false, message: 'This email address is already used' });

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
    const { role, firstName, lastName, email, phoneNumber, birthday, gender, password } = req.body;

    const hashPassword = await bcrypt.hash(password, BCRYPT_HASH_SALT);
    const isoDate = new Date(birthday).toISOString();
    const isoDateToken = new Date().toISOString();
    const user = await Users.create({
      role,
      firstName,
      lastName,
      email,
      phoneNumber,
      birthday: isoDate,
      gender,
      password: hashPassword,
      isVerified: true,
      country: 'USA',
      city: 'Yerevan',
      education: 'Harvard',
      backgroundInQA: true,
      tokenCreatedAt: isoDateToken,
    });

    return res.send(user);
  } catch (error) {
    console.log(error.name);
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
    const teachers = await Users.findAll({
      where: {
        role: 'TEACHER',
      },
    });
    const students = await Users.findAll({
      where: {
        role: 'STUDENT',
      },
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

    if (!user) return res.json({ succes: false, message: `with id ${id} user not found` });
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
    member.email = email;
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

const editImage = async (req, res) => {
  try {
    const { user_id: id } = req.user;
    const { avatarImage } = req.files; // Получаем изображение из запроса

    const user = await Users.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false });
    }

    // Предполагая, что avatarImage - это путь к временному файлу, загруженному через multer
    const imgType = avatarImage.mimetype.split('/')[1];
    const avatarFileName = v4() + '.' + imgType;

    // Сохраняем изображение в папке static
    await avatarImage.mv(path.resolve(__dirname, '..', 'static', avatarFileName));

    // Обновляем путь к аватару у пользователя
    user.avatarImage = avatarFileName;

    // Сохраняем изменения в базе данных
    await user.save();

    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
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
  deleteMembers,
  editImage,
};
