var express = require("express");
var router = express.Router();

const controller = require("../controlers/Chat/chatMessageController");
const checkAuth = require("../middleware/checkAuth");

router.post(
  "/createChatMessage/:chatId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.createChatMessage
);

router.get(
  "/getChatMessages/:chatId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getChatMessages
);

router.put(
  "/updateChatMessage/:chatId/:messageId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.updateChatMessage
);

router.delete(
  "/deleteChatMessage/:chatId/:messageId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.deleteChatMessage
);

module.exports = router;