var express = require("express");
var router = express.Router();

const controller = require("../controlers/AdminController");
const checkAuth = require("../middleware/checkAuth");

router.post('/', checkAuth(['SUPERADMIN']), controller.createAdmin);

module.exports = router;