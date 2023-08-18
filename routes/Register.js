var express = require("express");
var router = express.Router();

const controller = require("../controlers/RegisterController");

router.post("/", controller.UserRegistartion);
router.get("/sendEmail", controller.UserRegistartionSendEmail);
router.patch("/verification", controller.UserRegistartionVerification);


module.exports = router;
