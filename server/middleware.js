
const jwt = require("jsonwebtoken");
const { User } = require("./models");

// Require a valid JWT from the HTTP-only cookie.
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.shopdesk_token;

    if (!token) {
      return res.status(401).json({ message: "Please log in first" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    next(err);
  }
}

// Handle unexpected server errors without exposing secrets.
function errorHandler(err, req, res, next) {
  console.error(err.message);

  if (res.headersSent) return next(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "This record already exists" });
  }

  if (Number.isInteger(err.status) && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }

  res.status(500).json({ message: "Internal server error" });
}

module.exports = { requireAuth, errorHandler };
