var express = require("express");
var router = express.Router();

const controller = require("../controlers/CalendarController");
const checkAuth = require("../middleware/checkAuth");

router.post("/create", checkAuth(["TEACHER", "ADMIN"]), controller.create);
router.get("/findOne/:id", checkAuth(["TEACHER", "ADMIN"]), controller.findOne);
router.get("/findTodays", checkAuth(["STUDENT", "TEACHER", "ADMIN"]), controller.findTodays);
router.get("/findThisMonth", checkAuth(["STUDENT", "TEACHER", "ADMIN"]), controller.findThisMonth);
router.get("/findThisYear", checkAuth(["STUDENT", "TEACHER", "ADMIN"]), controller.findThisYear);
router.get("/findAll", checkAuth(["TEACHER", "ADMIN"]), controller.findAll);
router.patch("/update", checkAuth(["TEACHER", "ADMIN"]), controller.update);
router.delete("/remove/:id", checkAuth(["TEACHER", "ADMIN"]), controller.remove);



module.exports = router;
