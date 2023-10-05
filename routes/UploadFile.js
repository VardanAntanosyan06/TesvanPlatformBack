const uuid = require("uuid");
const path = require("path");
var express = require("express");
const checkAuth = require("../middleware/checkAuth");
var router = express.Router();

router.post(
  "/file",
  checkAuth(["STUDENT", "TEACHER", "ADMIN"]),
  async (req, res) => {
    try {
      const { file } = req.files;
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

module.exports = router;
