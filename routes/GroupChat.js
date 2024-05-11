var express = require("express");
var router = express.Router();

const controller = require("../controlers/Chat/groupChatController");
const checkAuth = require("../middleware/checkAuth");

// router.post(
//   "/createGroupChat",
//   checkAuth(["STUDENT","TEACHER", "ADMIN"]),
//   controller.createGroupChat
// );

router.get(
    "/getGroupChat/:groupChatId",
    checkAuth(["STUDENT","TEACHER", "ADMIN"]),
    controller.getGroupChat
);

// router.get(
//     "/getGroupChats",
//     checkAuth(["STUDENT","TEACHER", "ADMIN"]),
//     controller.getGroupChats
// );

// router.get(
//     "/getGroupChatMembers/:groupChatId",
//     checkAuth(["STUDENT","TEACHER", "ADMIN"]),
//     controller.getGroupChatMembers
// );

// router.patch(
//     "/updateNameGroupChat/:groupChatId",
//     checkAuth(["STUDENT","TEACHER", "ADMIN"]),
//     controller.updateNameGroupChat
// );

router.patch(
    "/addMemberGroupChat/:groupChatId",
    checkAuth(["STUDENT","TEACHER", "ADMIN"]),
    controller.addMemberGroupChat
  );

router.delete(
    "/deleteMemberGroupChat/:groupChatId",
    checkAuth(["STUDENT","TEACHER", "ADMIN"]),
    controller.deleteMemberGroupChat
);

router.delete(
    "/deleteGroupChat/:groupChatId",
    checkAuth(["STUDENT","TEACHER", "ADMIN"]),
    controller.deleteGroupChat
);

module.exports = router;