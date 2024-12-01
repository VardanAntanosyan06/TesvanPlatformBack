var express = require("express");
var router = express.Router();

const controller = require("../controlers/Chat/groupChatController");
const checkAuth = require("../middleware/checkAuth");

router.post(
    "/createGroupChat",
    checkAuth(["STUDENT", "TEACHER"]),
    controller.createGroupChat
);

router.get(
    "/getGroupChat/:groupChatId",
    checkAuth(["STUDENT", "TEACHER"]),
    controller.getGroupChat
);

router.get(
    "/getGroupChats",
    checkAuth(["STUDENT", "TEACHER"]),
    controller.getGroupChats
);

router.get(
    "/getGroupChatMembers/:groupChatId",
    checkAuth(["STUDENT", "TEACHER"]),
    controller.getGroupChatMembers
);

router.patch(
    "/updateNameGroupChat/:groupChatId",
    checkAuth(["STUDENT", "TEACHER"]),
    controller.updateNameGroupChat
);

router.patch(
    "/addMemberGroupChat/:groupChatId",
    checkAuth(["STUDENT", "TEACHER"]),
    controller.addMemberGroupChat
);

router.delete(
    "/deleteMemberGroupChat/:groupChatId",
    checkAuth(["STUDENT", "TEACHER"]),
    controller.deleteMemberGroupChat
);

router.delete(
    "/deleteGroupChat/:groupChatId",
    checkAuth(["STUDENT", "TEACHER"]),
    controller.deleteGroupChat
);

router.get(
    "/getGroupChatsForAdmin",
    checkAuth(["ADMIN"]),
    controller.getGroupChatsForAdmin
)

module.exports = router;