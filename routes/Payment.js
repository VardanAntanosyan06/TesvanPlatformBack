var express = require("express");
var router = express.Router();

const controller = require("../controlers/PaymentController");
const checkAuth = require("../middleware/checkAuth");

router.post("/payUrl", checkAuth(["TEACHER", "ADMIN", "STUDENT"]), controller.paymentUrl);

router.post("/buy", controller.paymentArca);

router.get("/getUserPayment", checkAuth(["TEACHER", "ADMIN", "STUDENT"]), controller.getUserPayment);

router.post("/monthlyPaymentUrl", checkAuth(["TEACHER", "ADMIN", "STUDENT"]), controller.monthlyPaymentUrl, controller.paymentUrl);

router.get("/getAllPayment", checkAuth(["TEACHER", "ADMIN"]), controller.getAllPayment);

router.get("/paymentCount", checkAuth(["TEACHER", "ADMIN", "STUDENT"]), controller.paymentCount)

router.get('/downloadInvoice', checkAuth(["TEACHER", "ADMIN", "STUDENT"]), controller.downloadInvoice)
// router.post("/monthlyPaymentIdram", controller.monthlyPaymentIdram, controller.paymentIdram);

// router.post("/monthlyPaymentArca", controller.monthlyPaymentArca, controller.paymentArca);

module.exports = router;
