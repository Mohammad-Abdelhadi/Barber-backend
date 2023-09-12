const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

// login a user
const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.login(email, password, role);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ email, token, role: user.role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// signup a user
const signupUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.signup(email, password, role);

    // Create a token
    const token = createToken(user._id);

    res.status(200).json({ email, token, role, appointments: [] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All users
const getAllusers = async (req, res) => {
  const allusers = await User.find({});

  try {
    res.status(200).json(allusers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const deleteUser = async (req, res) => {
  const { id } = req.params; // Use req.params.id
  try {
    const deletedUser = await User.findOneAndDelete({ _id: id });

    if (deletedUser) {
      res
        .status(200)
        .json({ message: "User deleted successfully", deletedUser });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const postAppointment = async (req, res) => {
  const { userId, barberName, services, time } = req.body;

  try {
    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new appointment object
    const newAppointment = {
      barberName,
      services,
      time,
    };

    // Push the new appointment to the user's appointments array
    user.appointments.push(newAppointment);

    // Save the updated user object to the database
    await user.save();

    res
      .status(201)
      .json({
        message: "Appointment created successfully",
        appointment: newAppointment,
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getAllusers,
  deleteUser,
  postAppointment,
};
