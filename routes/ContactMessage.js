var express = require("express");
var router = express.Router();

const controller = require("../controlers/ContactMessagesController");
const checkAuth = require("../middleware/checkAuth");

router.post("/create", controller.create);

module.exports = router;
