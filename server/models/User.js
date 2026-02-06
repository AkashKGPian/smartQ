const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String
    },

    passwordHash: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["PATIENT", "STAFF"],
      default: "PATIENT"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
