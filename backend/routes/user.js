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
  updateUser,
} = require("../controllers/userController");

const router = express.Router();

// Get all users
router.get("/", getAllusers);

// delete specif user
router.delete("/delete/:id", deleteUser);

// update the user information
router.patch("/updateuserinfo/:id", updateUser);

// login route
router.post("/login", loginUser);

// signup route
router.post("/signup", signupUser);

// *********** handle appoinments ********

// Create New appoinemnt
router.post("/postAppointment/:id", postAppointment);
// Get All appoinemnts for all users.
router.get("/getallappoinemnts", getallappoinemnts);

router.get("/getAppointmentsForUser/:userId", getAppointmentsForUser);

router.put(
  "/updateAppointmentStatus/:userId/:appointmentId",
  updateAppointmentStatus
);

module.exports = router;
