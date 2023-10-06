var express = require("express");
var router = express.Router();

const controller = require("../controlers/MessageController");
const checkAuth = require("../middleware/checkAuth");

router.post("/send", checkAuth(["TEACHER", "ADMIN"]), controller.send);
router.get(
  "/getNewMessages",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getNewMessages
);
router.get(
  "/getAllMessages",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getAllMessages
);

module.exports = router;
