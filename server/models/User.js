const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },

    phone: {
      type: String,
      index: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true
    },

    passwordHash: {
      type: String
    },

    role: {
      type: String,
      enum: ["PATIENT", "STAFF"],
      default: "PATIENT"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", UserSchema);
