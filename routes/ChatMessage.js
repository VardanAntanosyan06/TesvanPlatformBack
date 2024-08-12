var express = require("express");
var router = express.Router();

const controller = require("../controlers/Chat/chatMessageController");
const checkAuth = require("../middleware/checkAuth");

router.post(
  "/createChatMessage/:chatId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.createChatMessage
);

// router.post(
//   "/createChatFile/:chatId",
//   checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
//   controller.createChatFile
// );

router.post(
  "/replyChatMessage/:chatId/:messageId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.replyChatMessage
);

router.get(
  "/getChatMessages/:chatId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getChatMessages
);

router.get(
  "/getMessageNotifications",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getMessageNotifications
);

router.get(
  "/getMessageFile/:fileName",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getMessageFile
);

router.patch(
  "/updateChatMessage/:chatId/:messageId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.updateChatMessage
);

router.delete(
  "/deleteChatMessage/:chatId/:messageId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.deleteChatMessage
);

router.get('/readChatMessage/:chatId/:messageId',
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.readChatMessage
);

router.get('/getMessageNotifications',
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getMessageNotifications
);

module.exports = router;