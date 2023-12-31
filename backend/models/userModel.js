const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  barbers: {
    type: Array,
    default: function () {
      return this.role === "admin" ? [] : undefined;
    },
  },
  appointments: [
    {
      barber: {
        id: {
          type: Number, // Incremental id for barbers
          required: true,
        },
        name: String, // Barber name
        availableTime: {
          type: [String], // Array of available time slots for each barber
        },
      },

      services: [
        {
          id: {
            type: Number, // Use Number type for IDs
            required: true, // Make it required
          },
          name: String,
          price: Number,
          time: Number,
        },
      ],

      time: {
        type: String,
        required: true,
      },
      date: {
        type: String,
        required: true,
      },
      totalprice: {
        type: Number,
      },
      totaltime: { type: Number },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "completed"],
        default: "pending",
      },
    },
  ],
});

// Set appointments field to null by default
// userSchema.pre("save", function (next) {
//   if (this.isNew) {
//     this.appointments = null;
//   }
//   next();
// });
// static signup method
userSchema.statics.signup = async function (email, password, role) {
  // validation
  if (!email || !password) {
    throw Error("All fields must be filled");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password not strong enough");
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // Create the user without a barbers field
  const user = await this.create({
    email,
    password: hash,
    role,
  });

  return user;
};

// static login method
userSchema.statics.login = async function (email, password, role) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Incorrect email");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Incorrect password");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
// services: {
//   type: Object, // Change this to represent a flat object
//   required: true,
// },
