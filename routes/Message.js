var express = require("express");
var router = express.Router();

const controller = require("../controlers/MessageController");
const checkAuth = require("../middleware/checkAuth");

router.post(
  "/send",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.send
);
router.get(
  "/getUserMessages",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getUserMessages
);

module.exports = router;
