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
router.patch(
  "/markAllMessages",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.markAllMessages
);
// router.patch(
//   "/markMessage/:id",
//   checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
//   controller.markMessage
// );
router.delete(
  "/deleteMessage/:id",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.deleteMessage
);

module.exports = router;
