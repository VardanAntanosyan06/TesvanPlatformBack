const uuid = require("uuid");
const path = require("path");
var express = require("express");
var router = express.Router();

router.post("/img", async (req, res) => {
  try {
    const { img } = req.files;
    const type = img.mimetype.split("/")[1];
    const fileName = uuid.v4() + "." + type;
    img.mv(path.resolve(__dirname, "..", "static", fileName));

    return res.json({ url: fileName });
  } catch (e) {
    res.status(500).json({ succes: false });
    console.log(e);
  }
});

module.exports = router;
