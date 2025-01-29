var express = require("express");
var router = express.Router();

const controller = require("../controlers/CalendarController");
const checkAuth = require("../middleware/checkAuth");

router.post("/create", checkAuth(["TEACHER", "ADMIN", "SUPERADMIN"]), controller.create);
router.get("/findOne/:id", checkAuth(["STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"]), controller.findOne);
router.get("/findByDay", checkAuth(["STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"]), controller.findByDay);
router.get("/findByWeek", checkAuth(["STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"]), controller.findByWeek);
router.get("/getUsers", checkAuth(["TEACHER", "ADMIN", "SUPERADMIN"]), controller.getUsers);
router.get("/getUsersForTeacher", checkAuth(["TEACHER", "SUPERADMIN"]), controller.getUsersForTeacher);

router.get("/findByMonth", checkAuth(["STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"]), controller.findByMonth);
router.get("/findByYear", checkAuth(["STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"]), controller.findByYear);
router.get("/findAll", checkAuth(["TEACHER", "ADMIN", "SUPERADMIN"]), controller.findAll);
router.patch("/update", checkAuth(["TEACHER", "ADMIN", "SUPERADMIN"]), controller.update);
router.delete("/remove/:id", checkAuth(["TEACHER", "ADMIN", "SUPERADMIN"]), controller.remove);



module.exports = router;
