var express = require("express");
var router = express.Router();

const controller = require("../controlers/QuizzController");
const checkAuth = require("../middleware/checkAuth");

router.post("/createQuizz", checkAuth(["TEACHER", "ADMIN"]), controller.createQuizz);

module.exports = router;
