var express = require("express");
var router = express.Router();

const controller = require("../controlers/CertificatesController");
const checkAuth = require("../middleware/checkAuth");


router.get(
  "/getAllStudents",
  checkAuth(["TEACHER", "ADMIN"]),
  controller.findAllStudents
);

module.exports = router;
