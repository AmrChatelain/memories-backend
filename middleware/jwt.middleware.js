const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // If unauthorized token

  if (!token) {
    return res.status(401).json({
      error: true,
      message: "No token provided",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // If invalid Token
    if (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid token",
      });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
