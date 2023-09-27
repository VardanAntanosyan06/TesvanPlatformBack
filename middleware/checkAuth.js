const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    if (req.method === "OPTIONS") {
      return next();
    }
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false });
    }
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ success: false });
    console.log(e);
  }
};
