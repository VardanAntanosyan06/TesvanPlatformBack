const { Model } = require("sequelize");
const { Users } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const moment = require("moment")
const nodemailer = require("nodemailer");
const {
  UserRegistartionSendEmail,
} = require("../controlers/RegisterController");

const LoginUsers = async (req, res) => {
  try {
    const { email, password } = req.body;

    const User = await Users.findOne({
      where: { email },
    });
    if (
      User &&
      User.isVerified &&
      (await bcrypt.compare(password, User.password))
    ) {
      return res.status(200).json({ User });
    }
    return res.status(403).json({ message: "Invalid email or password" });
  } catch (error) {
    console.log(error);
  }
};

const sendEmailForForgotPassword = async (req, res) => {
  try {
    const { email } = req.query;

    const User = await Users.findOne({ where: { email } });

    if (!User || (User && !User.isVerified))
      return res.status(403).json({ message: "There is not verified user" });

    User.token = jwt.sign({ user_id: User.id, email }, process.env.SECRET);
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
              Tesvan Platform Password
              </h1>
             <a href="http://localhost:3000/changePassword?token=${User.token}">http://localhost:3000/changePassword?token=${User.token}</a>
        </body>
      </html>
      `,
    };

    transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const User = await Users.findOne({
      where: { token },
    });
    if (!User) return res.status(404).json({ message: "User not found!" });

    if (moment().diff(User.tokenCreatedAt, "hours") <= 24) {
      User.token = jwt.sign(
        { user_id: User.id, email: User.email },
        process.env.SECRET
      );
      User.tokenCreatedAt = moment();
      await User.save();

      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      User.password = newHashedPassword;
      User.save();
      return res.json({ success: true });
    }
    return res.status(403).json({ message: "Token Timeout!" });
  } catch (error) {
    console.log(error);
  }
};

const changeEmail = async (req, res) => {
  try {
    const { email, newEmail } = req.body;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(newEmail))
      return res.status(403).json({ message: "Invalid email format" });
    const User = await Users.findOne({
      where: { email },
    });
    if (!User) return res.status(404).json({ message: "User not Found" });
    User.email = newEmail;
    User.save();

    req.query.email = req.body.email;
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
      to: newEmail,
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
  }
};

module.exports = {
  LoginUsers,
  sendEmailForForgotPassword,
  forgotPassword,
  changeEmail,
};
