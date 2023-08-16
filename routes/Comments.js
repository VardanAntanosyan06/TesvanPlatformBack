var express = require("express");
var router = express.Router();

const controller = require("../controlers/CommentsController");

router.get("/getAll", controller.getAllComments);

module.exports = router;
