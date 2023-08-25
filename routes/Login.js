var express = require("express");
var router = express.Router();

const controller = require("../controlers/LoginController");

router.post("/Login", controller.LoginUsers);
router.get("/ForgotPassword", controller.sendEmailForForgotPassword);
router.patch("/ChangePassword", controller.forgotPassword)
// router.get("/sendEmail", controller.UserRegistartionSendEmail);
// router.patch("/verification", controller.UserRegistartionVerification);


module.exports = router;
