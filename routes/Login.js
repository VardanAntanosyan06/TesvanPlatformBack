var express = require("express");
var router = express.Router();

const controller = require("../controlers/LoginController");
const checkAuth = require("../middleware/checkAuth");

router.post("/Login", controller.LoginUsers);
router.get("/ForgotPassword", controller.sendEmailForForgotPassword);
router.patch("/ChangePassword", controller.forgotPassword);
router.patch("/ChangeEmail", controller.changeEmail);
router.get(
  "/authMe",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.authMe
);
  router.put("/changeUserData",checkAuth(["STUDENT", "TEACHER"]), controller.changeUserData);
// router.patch("/verification", controller.UserRegistartionVerification);

module.exports = router;
