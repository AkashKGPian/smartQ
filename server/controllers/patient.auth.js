const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../helpers/auth.helpers");
const { signToken } = require('../helpers/jwt.helper');

// render signup page
const renderSignup = (req, res) => {
  res.render("patient-signup");
};

// render login page
const renderLogin = (req, res) => {
  res.render("patient-login");
};

// patient signup
const signupPatient = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).send("All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send("Email already registered");
    }

    const passwordHash = await hashPassword(password);

    await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: "PATIENT"
    });

    // If browser form, redirect to login page
    if (req.headers.accept?.includes('text/html')) {
      return res.redirect('/api/auth/patient/login');
    }
    res.send("Patient signup successful");
  } catch (err) {
    console.error('signupPatient error:', err);
    res.status(500).send('Server error');
  }
};

// patient login
async function patientLogin(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'PATIENT' });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({ message: 'Patient logged in' });
  } catch (err) {
    console.error('patientLogin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// patient logout
function patientLogout(req, res) {
  res.clearCookie('token');
  if (req.headers.accept?.includes('text/html')) {
    return res.redirect('/api/auth/patient/login');
  }
  res.status(200).json({ message: 'Logged out' });
}

module.exports = {
  renderSignup,
  renderLogin,
  signupPatient,
  patientLogin,
  patientLogout,
};
