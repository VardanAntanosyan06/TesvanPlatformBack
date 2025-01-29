var express = require("express");
var router = express.Router();

const controller = require("../controlers/PaymentController");
const checkAuth = require("../middleware/checkAuth");
const checkAuthAdminPayment = require("../middleware/checkAuthAdminPayment")

router.post("/payUrl", checkAuth(["TEACHER", "ADMIN", "STUDENT"]), controller.paymentUrl);

router.post("/paymentUrlForAdmin", checkAuthAdminPayment(["ADMIN"]), controller.paymentUrlForAdmin);

router.post("/buy", controller.paymentArca);

router.post("/paymentArcaForAdmin", checkAuthAdminPayment(["ADMIN"]), controller.paymentArcaForAdmin);

router.get("/getUserPayment", checkAuth(["TEACHER", "ADMIN", "STUDENT"]), controller.getUserPayment);

router.post("/monthlyPaymentUrl", checkAuth(["TEACHER", "ADMIN", "STUDENT"]), controller.monthlyPaymentUrl, controller.paymentUrl);

router.get("/getAllPayment", checkAuth(["TEACHER", "ADMIN"]), controller.getAllPayment);

router.get("/getAdminPayment", checkAuthAdminPayment(["ADMIN"]), controller.getAdminPayment);

router.get("/nextPaymentAdmin", checkAuthAdminPayment(["ADMIN"]), controller.nextPaymentAdmin);

router.get("/paymentCount", checkAuth(["TEACHER", "ADMIN", "STUDENT"]), controller.paymentCount)

router.get('/downloadInvoice', checkAuthAdminPayment(["TEACHER", "ADMIN", "STUDENT", "SUPERADMIN"]), controller.downloadInvoice)

router.get('/getAllSubscriptionsForSuperAdmin', checkAuth(["SUPERADMIN"]), controller.getAllSubscriptionsForSuperAdmin)

router.get('/getAdminPaymentsForSuperAdmin/:id', checkAuth(["SUPERADMIN"]), controller.getAdminPaymentsForSuperAdmin)


// router.post("/monthlyPaymentIdram", controller.monthlyPaymentIdram, controller.paymentIdram);

// router.post("/monthlyPaymentArca", controller.monthlyPaymentArca, controller.paymentArca);

module.exports = router;
