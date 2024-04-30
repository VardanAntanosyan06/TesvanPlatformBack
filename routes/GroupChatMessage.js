var express = require("express");
var router = express.Router();

const controller = require("../controlers/Chat/groupChatMessageController");
const checkAuth = require("../middleware/checkAuth");

router.post(
  "/createGroupChatMessage/:chatId",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.createGroupChatMessage
);

router.get('/getGroupChatMessages/:chatId',
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  controller.getGroupChatMessages
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