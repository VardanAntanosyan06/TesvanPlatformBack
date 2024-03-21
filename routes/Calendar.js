var express = require("express");
var router = express.Router();

const controller = require("../controlers/CalendarController");
const checkAuth = require("../middleware/checkAuth");

router.post("/create", checkAuth(["TEACHER", "ADMIN"]), controller.create);
router.get("/findOne/:id", checkAuth(["STUDENT", "TEACHER", "ADMIN"]), controller.findOne);
router.get("/findByDay", checkAuth(["STUDENT", "TEACHER", "ADMIN"]), controller.findByDay);
router.get("/findByWeek", checkAuth(["STUDENT", "TEACHER", "ADMIN"]), controller.findByWeek);
router.get("/getUsers", checkAuth(["TEACHER", "ADMIN"]), controller.getUsers);

router.get("/findByMonth", checkAuth(["STUDENT", "TEACHER", "ADMIN"]), controller.findByMonth);
router.get("/findByYear", checkAuth(["STUDENT", "TEACHER", "ADMIN"]), controller.findByYear);
router.get("/findAll", checkAuth(["TEACHER", "ADMIN"]), controller.findAll);
router.patch("/update", checkAuth(["TEACHER", "ADMIN"]), controller.update);
router.delete("/remove/:id", checkAuth(["TEACHER", "ADMIN"]), controller.remove);



module.exports = router;
