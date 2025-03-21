var express = require("express");
var router = express.Router();

const controller = require("../controlers/CertificatesController");
const checkAuth = require("../middleware/checkAuth");


router.get(
  "/getAllStudents",
  // checkAuth(["TEACHER", "ADMIN"]),
  controller.findAllStudents
);
router.get(
  "/getUserCertificates",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getUserCertificates
);

router.patch(
  "/changeStatus",
  checkAuth(["ADMIN"]),
  controller.changeStatus
);

router.post(
  "/:id",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.downloadCertificate
)

module.exports = router;
