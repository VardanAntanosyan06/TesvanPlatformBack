const uuid = require("uuid");
const path = require("path");
var express = require("express");
const {Users} = require("../models")
const checkAuth = require("../middleware/checkAuth");
var router = express.Router();
var fs =  require("fs")
router.post(
  "/file",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  async (req, res) => {
    try {
      const { file } = req.files;
      console.log(file);
      const type = file.mimetype.split("/")[1];
      const fileName = uuid.v4() + "." + type;
      file.mv(path.resolve(__dirname, "..", "static", fileName));


      return res.json({ url: fileName });
    } catch (e) {
      res.status(500).json({ succes: false });
      console.log(e);
    }
  }
);
router.post(
  "/setDefault",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  async (req, res) => {
    try {
      const { user_id:userId } = req.user;
      // console.log(file);
      // const type = file.mimetype.split("/")[1];
      // const fileName = uuid.v4() + "." + type;
      // file.mv(path.resolve(__dirname, "..", "static", fileName));
      const user = await Users.findByPk(userId)

      user.img = "defaultIcon.png"
      user.save()
      return res.json({ succes:true });
    } catch (e) {
      res.status(500).json({ succes: false });
      console.log(e);
    }
  }
)

router.delete(
  "/file/:fileName",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  async (req, res) => {
    try {
      const { fileName } = req.params;

      fs.unlinkSync(path.resolve(__dirname, "..", "static", fileName));
      
      return res.json({ succes:true });
    } catch (e) {
      res.status(500).json({ succes: false });
      console.log(e);
    }
  }
);


module.exports = router;
