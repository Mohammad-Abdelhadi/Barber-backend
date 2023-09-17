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

//   const { userId, barberName, services, time, status } = req.body;

//   try {
//     // Find the user by their ID
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Create a new appointment object
//     const newAppointment = {
//       barberName,
//       services,
//       time,
//       status,
//     };

//     // Push the new appointment to the user's appointments array
//     user.appointments.push(newAppointment);

//     // Save the updated user object to the database
//     await user.save();

//     res.status(201).json({
//       message: "Appointment created successfully",
//       appointment: newAppointment,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

const postAppointment = async (req, res) => {
  const { userId, barberName, appointments } = req.body;

  try {
    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Loop through the appointments array and push each appointment to the user's appointments
    for (const appointmentData of appointments) {
      user.appointments.push(appointmentData);
    }

    // Save the updated user object to the database
    await user.save();

    res.status(201).json({
      message: "Appointments created successfully",
      appointments,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


//   try {
//     // Find the user by their ID
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Define default times for each service (in minutes)
//     const defaultTimes = {
//       hairCut: 15,
//       hairColoring: 20,
//       hairWash: 15,
//       shaving: 10,
//       skinCare: 25,
//       hairDryer: 15,
//     };

//     // Create a new appointment object
//     const newAppointment = {
//       barberName,
//       services: {
//         [service]: {
//           price: 0, // You can set the price as needed
//         },
//       },
//       time: `Default time: ${defaultTimes[service]} minutes`,
//       status,
//     };

//     // Push the new appointment to the user's appointments array
//     user.appointments.push(newAppointment);

//     // Save the updated user object to the database
//     await user.save();

//     res.status(201).json({
//       message: "Appointment created successfully",
//       appointment: newAppointment,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

const getallappoinemnts = async (req, res) => {
  try {
    // Find all users and select only the "_id" and "appointments" fields
    const users = await User.find({}, "_id appointments");

    // Create an array of objects containing user ID and their appointments
    const usersWithAppointments = users.map((user) => ({
      userId: user._id,
      appointments: user.appointments,
    }));

    res.status(200).json(usersWithAppointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAppointmentsForUser = async (req, res) => {
  const userId = req.params.userId; // Get the user ID from the request parameters

  try {
    // Find the user by their ID and select the "appointments" field
    const user = await User.findById(userId, "appointments");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const appointments = user.appointments || []; // Get the appointments or an empty array if none exist

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  const { userId, appointmentId } = req.params;
  const { newStatus } = req.body;

  try {
    // Find the user by their ID and select the "appointments" field
    const user = await User.findById(userId, "appointments");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the appointment by its ID
    const appointment = user.appointments.find(
      (apt) => apt._id.toString() === appointmentId
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update the status of the appointment
    appointment.status = newStatus;

    // Save the updated user object to the database
    await user.save();

    res
      .status(200)
      .json({ message: "Appointment status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getAllusers,
  deleteUser,
  postAppointment,
  getallappoinemnts,
  getAppointmentsForUser,
  updateAppointmentStatus,
};
