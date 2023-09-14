const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const AdminRequireAuth = async (req, res, next) => {
  // Verify user is authenticated
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { _id, role } = jwt.verify(token, process.env.SECRET);

    req.user = await User.findOne({ _id }).select("_id");

    // Check if the user has the "admin" role
    req.isAdmin = role === "admin";

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = AdminRequireAuth;
