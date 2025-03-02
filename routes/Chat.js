var express = require("express");
var router = express.Router();

const controller = require("../controlers/Chat/chatController");
const checkAuth = require("../middleware/checkAuth");

router.post(
  "/createChat",
  checkAuth(["STUDENT","TEACHER", "ADMIN"]),
  controller.createChat
);

router.get(
    "/getChat/:chatId",
    checkAuth(["STUDENT","TEACHER", "ADMIN"]),
    controller.getChat
);

router.get(
    "/getChats",
    checkAuth(["STUDENT","TEACHER", "ADMIN"]),
    controller.getChats
);

router.delete(
    "/deleteChat/:chatId",
    checkAuth(["STUDENT","TEACHER", "ADMIN"]),
    controller.deleteChat
);

router.get(
    "/getAdminChats",
    checkAuth(["STUDENT","TEACHER", "ADMIN"]),
    controller.getAdminChats
);

module.exports = router;