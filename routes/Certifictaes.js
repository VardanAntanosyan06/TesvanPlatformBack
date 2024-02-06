var express = require("express");
var router = express.Router();

const controller = require("../controlers/CertificatesController");
const checkAuth = require("../middleware/checkAuth");


router.get(
  "/getAllStudents",
  checkAuth(["TEACHER", "ADMIN"]),
  controller.findAllStudents
);

router.patch(
  "/changeStatus",
  checkAuth(["ADMIN"]),
  controller.changeStatus
);
module.exports = router;
