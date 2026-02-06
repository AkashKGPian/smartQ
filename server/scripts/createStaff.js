require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

//node server/scripts/createStaff.js
//run the above line to create a staff account with given email and password (see below)
// Staff accounts are provisioned via admin scripts to prevent unauthorized role creation and privilege abuse

const createStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "staff@hospital.com";
    const plainPassword = "password123";

    const existing = await User.findOne({ email, role: "STAFF" });
    if (existing) {
      console.log("❌ Staff already exists");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    await User.create({
      email,
      passwordHash,
      role: "STAFF"
    });

    console.log("✅ Staff account created");
    console.log("Email:", email);
    console.log("Password:", plainPassword);

    process.exit(0);
  } catch (err) {
    console.error("Error creating staff:", err);
    process.exit(1);
  }
};

createStaff();
