var express = require("express");
var router = express.Router();

const controller = require("../controlers/GroupController");
const checkAuth = require("../middleware/checkAuth");

router.post("/create", checkAuth(["ADMIN"]), controller.CreateGroup);
router.post("/addMember", checkAuth(["ADMIN"]), controller.addMember);
router.post("/addUserSkill", checkAuth(["TEACHER", "ADMIN"]), controller.AddUserSkill);
router.post("/recordUserStatics", checkAuth(["TEACHER","ADMIN","STUDENT"]), controller.recordUserStatics);


router.get("/findOne/:id", checkAuth(["TEACHER", "ADMIN","STUDENT"]), controller.findOne);
router.get("/getUserStaticChart/:groupId", checkAuth(["TEACHER", "ADMIN"]), controller.getUserStaticChart);
router.get("/findAll", checkAuth(["TEACHER", "ADMIN","STUDENT"]), controller.findAll);
router.get("/singleUserStstic", checkAuth(["TEACHER", "ADMIN"]), controller.SingleUserStstic);

router.patch("/update/:id", checkAuth(["ADMIN"]), controller.update);
router.patch("/finishGroup/:id", checkAuth(["TEACHER","ADMIN"]), controller.finishGroup);

router.delete("/delete/:id", checkAuth(["ADMIN"]), controller.remove);



module.exports = router;
