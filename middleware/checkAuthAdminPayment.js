const jwt = require("jsonwebtoken");

module.exports = function (roles) {
  return function (req, res, next) {
    try {
      if (req.method === "OPTIONS") {
        return next();
      }
      const token = req.headers?.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ success: false });
      }
      const decoded = jwt.verify(token, process.env.SECRET);
      if (!roles?.includes(decoded.role)) {
        return res.status(401).json({ message: "You don't have access" });
      }
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ success: false });
      console.log(e);
    }
  };
};