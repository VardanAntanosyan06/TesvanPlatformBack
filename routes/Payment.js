var express = require("express");
var router = express.Router();

const controller = require("../controlers/PaymentController");
const checkAuth = require("../middleware/checkAuth");

router.post("/payUrl", checkAuth(["TEACHER", "ADMIN", "STUDENT"]), controller.paymentUrlArca);

// router.post("/configidram", controller.ConfirmIdram);
router.post("/buy", controller.paymentArca);

router.get("/getUserPayment", checkAuth(["TEACHER", "ADMIN", "STUDENT"]), controller.getUserPayment);

// router.post("/monthlyPayment", checkAuth(["TEACHER", "ADMIN", "STUDENT"]), controller.monthlyPayment);

// router.post("/monthlyPaymentArca", checkAuth(["TEACHER", "ADMIN", "STUDENT"]), controller.monthlyPaymentArca);

module.exports = router;
