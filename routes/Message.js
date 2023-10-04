var express = require("express");
var router = express.Router();

const controller = require("../controlers/MessageController");
const checkAuth = require("../middleware/checkAuth");

router.post("/send", checkAuth, controller.send);
router.get("/getUserMessages", checkAuth, controller.getUserMessages);

module.exports = router;
