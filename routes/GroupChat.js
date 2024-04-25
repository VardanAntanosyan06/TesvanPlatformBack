var express = require("express");
var router = express.Router();

const controller = require("../controlers/Chat/groupChatController");
const checkAuth = require("../middleware/checkAuth");

router.post(
  "/createGroupChat",
  checkAuth(["STUDENT","TEACHER", "ADMIN"]),
  controller.createGroupChat
);

router.get(
    "/getGroupChat/:groupChatId",
    checkAuth(["STUDENT","TEACHER", "ADMIN"]),
    controller.getGroupChat
);

router.get(
    "/getGroupChats",
    checkAuth(["STUDENT","TEACHER", "ADMIN"]),
    controller.getGroupChats
);

router.put(
    "/updateNameGroupChat/:groupChatId",
    checkAuth(["STUDENT","TEACHER", "ADMIN"]),
    controller.updateNameGroupChat
);

// router.delete(
//     "/deleteChat/:chatId",
//     checkAuth(["STUDENT","TEACHER", "ADMIN"]),
//     controller.deleteChat
// );

module.exports = router;