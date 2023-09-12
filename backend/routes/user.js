const express = require("express");

// controller functions
const {
  loginUser,
  signupUser,
  getAllusers,
  deleteUser,
  postAppointment
} = require("../controllers/userController");

const router = express.Router();

// Get all users
router.get("/", getAllusers);
// Get all users
router.delete("/delete/:id", deleteUser);
// login route
router.post("/login", loginUser);

// signup route
router.post("/signup", signupUser);
router.post("/postAppointment", postAppointment);

module.exports = router;
