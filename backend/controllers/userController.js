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
    let user;

    if (role === "admin") {
      // If the role is admin, create an admin user with barbers
      // Define the barbers array or provide an empty array if none
      const barbers = []; // You can define your barbers here

      user = await User.signup(email, password, role, barbers);
    } else {
      // If the role is user, create a user with appointments
      user = await User.signup(email, password, role, []);
    }

    // Create a token
    const token = createToken(user._id);

    // Respond with user data
    if (user.role === "admin") {
      res.status(200).json({ email, token, role, barbers: user.barbers });
      console.log(user.role);
    } else {
      res.status(200).json({ email, token, role, appointments: [] });
      console.log(user.role);
    }
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

// delete User

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

// Update the user information

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const updatedUserData = req.body;

  try {
    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data with the new values
    user.email = updatedUserData.email || user.email;
    user.password = updatedUserData.password || user.password;
    user.role = updatedUserData.role || user.role;

    // Save the updated user object to the database
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//   try {
//     // Find the user by their ID
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Loop through the appointments array and push each appointment to the user's appointments
//     for (const appointmentData of appointments) {
//       user.appointments.push(appointmentData);
//     }

//     // Save the updated user object to the database
//     await user.save();

//     res.status(201).json({
//       message: "Appointments created successfully",
//       appointments,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

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
// const postAppointment = async (req, res) => {
//   const { barberName, appointments } = req.body;
//   const userId = req.params.id;

//   try {
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check for appointment conflicts
//     for (const appointmentData of appointments) {
//       const { date, time } = appointmentData;

//       const conflict = user.appointments.find(
//         (apt) => apt.date === date && apt.time === time
//       );

//       if (conflict) {
//         return res.status(409).json({
//           message: `Conflict: Appointment at ${date} ${time} already exists.`,
//         });
//       }

//       // Add the new appointment
//       user.appointments.push(appointmentData);
//     }

//     await user.save();

//     res.status(201).json({
//       message: "Appointments created successfully",
//       appointments,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

const postAppointment = async (req, res) => {
  const { appointments } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    for (const appointmentData of appointments) {
      const { barber, date, time } = appointmentData;

      // Check for appointment conflicts
      const conflict = user.appointments.find(
        (apt) =>
          apt.barber.id === barber.id && apt.date === date && apt.time === time
      );

      if (conflict) {
        return res.status(409).json({
          message: `Conflict: Appointment with barber ${barber.name} at ${date} ${time} already exists.`,
        });
      }

      // Create the appointment
      user.appointments.push(appointmentData);
    }

    await user.save();

    res.status(201).json({
      message: "Appointments created successfully",
      appointments,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

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

    const appointments = user.appointments || [];
    // Get the appointments or an empty array if none exist

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getbarbers = async (req, res) => {
  const userId = req.params.userId; // Get the user ID from the request parameters

  try {
    // Find the user by their ID and select the "appointments" field
    const user = await User.findById(userId, "barbers");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const barbers = user.barbers || [];
    // Get the appointments or an empty array if none exist

    res.status(200).json(barbers);
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

// const addBarber = async (req, res) => {
//   const { id, name, availableTime } = req.body;

//   try {
//     const user = await User.findById(req.params.userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if the user is an admin
//     if (user.role !== "admin") {
//       return res
//         .status(403)
//         .json({ message: "Only admin users can add barbers" });
//     }

//     // Check if a barber with the same ID already exists
//     const existingBarber = user.barbers.find((barber) => barber.id === id);

//     if (existingBarber) {
//       return res
//         .status(409)
//         .json({ message: `Barber with ID ${id} already exists` });
//     }

//     // Add the new barber to the user's barbers array
//     user.barbers.push({ id, name, availableTime });

//     // Save the updated user object with the new barber
//     await user.save();

//     res.status(201).json({
//       message: "Barber added successfully",
//       barber: { id, name, availableTime },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const addBarber = async (req, res) => {
  const { id, name } = req.body;

  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is an admin
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin users can add barbers" });
    }

    // Check if a barber with the same ID already exists
    const existingBarber = user.barbers.find((barber) => barber.id === id);

    if (existingBarber) {
      return res
        .status(409)
        .json({ message: `Barber with ID ${id} already exists` });
    }

    // Generate available time slots from 9:00 AM to 10:00 PM
    const availableTime = generateAvailableTimeSlots();

    // Add the new barber to the user's barbers array
    user.barbers.push({ id, name, availableTime });

    // Save the updated user object with the new barber
    await user.save();

    res.status(201).json({
      message: "Barber added successfully",
      barber: { id, name, availableTime },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to generate available time slots
function generateAvailableTimeSlots() {
  const availableTime = [];
  const startTime = 9; // Start at 9:00 AM
  const endTime = 22; // End at 10:00 PM

  for (let hour = startTime; hour <= endTime; hour++) {
    for (let minute = 0; minute < 60; minute += 60) {
      const timeSlot = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      availableTime.push(timeSlot);
    }
  }

  return availableTime;
}

module.exports = {
  signupUser,
  loginUser,
  getAllusers,
  deleteUser,
  postAppointment,
  getallappoinemnts,
  getAppointmentsForUser,
  updateAppointmentStatus,
  updateUser,
  addBarber,
  getbarbers,
};
