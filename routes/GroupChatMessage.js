var express = require("express");
var router = express.Router();

const controller = require("../controlers/Chat/groupChatMessageController");
const checkAuth = require("../middleware/checkAuth");

router.post(
  "/createGroupChatMessage/:chatId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.createGroupChatMessage
);

router.post(
  "/replyGroupChatMessage/:chatId/:messageId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.replyGroupChatMessage
);

router.get('/getGroupChatMessages/:chatId',
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getGroupChatMessages
)

router.get('/readGroupChatMessage/:chatId/:messageId',
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.readGroupChatMessage
)

router.get('/seenGroupChatMessage/:chatId/:messageId',
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.seenGroupChatMessage
)

router.patch(
  "/updateGroupChatMessage/:chatId/:messageId/",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.updateGroupChatMessage
);

router.delete(
  "/deleteGroupChatMessage/:chatId/:messageId/",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.deleteGroupChatMessage
);

module.exports = router;