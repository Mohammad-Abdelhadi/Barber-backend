const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const AdminRequireAuth = require("../middleware/AdminRequireAuth");

// controller functions
const {
  loginUser,
  signupUser,
  getAllusers,
  deleteUser,
  postAppointment,
  getallappoinemnts,
  getAppointmentsForUser,
  updateAppointmentStatus,
} = require("../controllers/userController");

const router = express.Router();

// Get all users
router.get("/", AdminRequireAuth, getAllusers);
// Get all users
router.delete("/delete/:id", deleteUser);
// login route
router.post("/login", loginUser);

// signup route
router.post("/signup", signupUser);

// *********** handle appoinments ********

// Create New appoinemnt
router.post("/postAppointment", postAppointment);
// Get All appoinemnts for all users.
router.get("/getallappoinemnts", getallappoinemnts);

router.get("/getAppointmentsForUser/:userId", getAppointmentsForUser);

router.put(
  "/updateAppointmentStatus/:userId/:appointmentId",
  updateAppointmentStatus
);

module.exports = router;
