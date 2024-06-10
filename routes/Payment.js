var express = require("express");
var router = express.Router();

const controller = require("../controlers/PaymentController");
const checkAuth = require("../middleware/checkAuth");

router.post(
  "/payUrl",
  checkAuth(["TEACHER", "ADMIN", "STUDENT"]),
  controller.payUrl
);

router.post("/configidram", controller.ConfirmIdram);
router.post("/buy", controller.buy);
  
module.exports = router;
