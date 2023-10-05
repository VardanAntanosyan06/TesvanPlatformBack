const { Users } = require("../models");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

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
    if (isUser)
      return res.status(403).json({ message: "Email must be unique." });
    const hashedPassword = await bcrypt.hash(password, 10);
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
    User.token = jwt.sign(
      { user_id: User.id, email, role: "STUDENT" },
      process.env.SECRET
    );
    await User.save();
    return res.status(200).json({ succes: true });
  } catch (error) {
    console.log(error.message);
    if (error.name == "SequelizeValidationError") {
      return res.status(403).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Something went wrong." });
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
      return res.status(404).json({ message: "There is not unverified user!" });
    User.token = jwt.sign(
      { user_id: User.id, email, role: "STUDENT" },
      process.env.SECRET
    );
    User.tokenCreatedAt = moment();
    await User.save();
    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465,
      secure: true,
      service: "privateemail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: "info@sisprogress.com",
      to: email,
      subject: "test",
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
          <link
            href="https://fonts.googleapis.com/css?family=Poppins"
            rel="stylesheet"
          />
        </head>
        <body>
          <center>
            <h1
              style="
                font-style: normal;
                font-weight: 600;
                font-size: 32px;
                line-height: 48px;
              "
            >
              Tesvan Platform
              </h1>
             <a href="http://localhost:3000/verify?token=${User.token}">http://localhost:3000/verify?token=${User.token}</a>
        </body>
      </html>
      `,
    };

    transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const UserRegistartionVerification = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(403).json("token can't be empty");
    const User = await Users.findOne({
      where: { token },
    });
    if (!User) return res.status(404).json({ message: "user not found!" });
    if (moment().diff(User.tokenCreatedAt, "hours") <= 24) {
      User.isVerified = true;
      User.token = jwt.sign(
        { user_id: User.id, email: User.email, role: User.role },
        process.env.SECRET
      );
      User.tokenCreatedAt = moment();
      await User.save();

      return res.status(200).json({ success: true });
    }
    return res.status(403).json({ message: "token timeout!" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  UserRegistartion,
  UserRegistartionSendEmail,
  UserRegistartionVerification,
};
