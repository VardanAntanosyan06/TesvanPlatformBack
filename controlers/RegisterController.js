const { Users } = require("../models");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");

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
      { user_id: User.id, email, role },
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
      { user_id: User.id, email, role: User.role },
      process.env.SECRET
    );
    User.tokenCreatedAt = moment();
    await User.save();
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: 't37378844@gmail.com',
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
          <center style="height:1000px;">
            <h1
              style="
                
                font-style: normal;
                font-weight: 600;
                font-size: 32px;
                line-height: 48px;
              "
            >
            Welcome to Tesvan Platform
            
            </h1>
            
            <img src="cid:messageIcon" alt="" style="width:185px;"/>
            <div style="width: 70%">
              <h1
                style="
                  
                  font-style: normal;
                  font-weight: 600;
                  font-size: 32px;
                  line-height: 48px;
                "
              >
                Please verify your email address.
              </h1>
              <p
                        style="
                          
                          font-style: normal;
                          font-size: 20px;
                          text-align: left;
                        "
                      >
                        In order to complete your registration and start preparing for
                        college admissions, you'll need to verify your email address.
                      </p> 
              <p
                style="
                  
                  font-style: normal;
                  font-size: 20px;
                  text-align: left;
                  "
              >
                You've entered ${email} as the email address for your account. Please
                verify this email address by clicking button below.
              </p>
              <a href="http://localhost:3000/verify?token=${User.token}" style="text-decoration:none">
                <div
                  style="
                    width: 130px;
                    height: 40px;
                    background: #FFC038;
                    border-radius: 5px;
                    border:none;  
                    font-style: normal;
                    font-weight: 500;
                    font-size: 18px;
                    line-height: 27px;
                    color: #143E59;
                    cursor:pointer;
                    padding:7px;
                    box-sizing:border-box;
                  "
                >
                  Verify
                </div>
              </a>
            </div>
            <div
              style="width: 70%;margin-top: 30px"
              style="border-top: 1px solid #d4d4d4;border-bottom: 1px solid #d4d4d4;"
            >
              <p style="font-size: 20px; line-height: 30px;text-align:left;"
                >If the button is not working please use the link below:
                <a
                href="http://localhost:3000/verify?token=${User.token}"
                  style="color: #425dac;text-align:left;font-size:18px;"
                  >http://localhost:3000/verify?token=${User.token}</a
                >
              </p>
            </div>
            <div
            style="
              width: 70%;
              margin-top: 25px;
              margin-bottom: 25px;
              border-top: 1px solid #d4d4d4;
              border-bottom: 1px solid #d4d4d4;
              ">
            <p
            style="
            display:flex;
            
            font-weight: 500;
            font-size: 18px;
            line-height: 27px;
            color: #646464;
            text-align: left;
           "
            >
              Regards,
            </p>
            <div style="display:flex;">
            <img src="cid:Frame" alt="" width="50px"/>
            </div>
            <p
            style="
            display:flex;
            
            font-weight: 500;
            font-size: 18px;
            line-height: 27px;
            color: #646464;
            text-align: left;
           "
            >
             
          </div>
          <div style="width:70%">
          <p style="
          
          font-style: normal;
          font-weight: 500;
          font-size: 18px;
          line-height: 27px;
          color: #646464;
          text-align: center;
          margin-top:15px;
          ">© 2023 Tesvan, All rights reserved</p></div>
          </center>
          <style>
          *{
            color:black;
          }
            div {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            p {
              text-align: left;

            }
            a{
              color:unset
            }
          </style>
        </body>
      </html>
      `,
      attachments: [
        {
          filename: "messageIcon.png",
          path: path.resolve(__dirname, '..', 'public',"images", 'messageIcon.png'),
          cid: "messageIcon",
        },
        {
          filename: "Frame.png",
          path: path.resolve(__dirname, '..', 'public',"images", 'Frame.png'),
          cid: "Frame",
        },
      ],
    };

    transporter.sendMail(mailOptions).catch(console.log);

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
    if (!User) return res.status(404).json({ message: "User not found!" });
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
