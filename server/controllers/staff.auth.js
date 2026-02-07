const User = require("../models/User");
const { verifyPassword } = require("../helpers/auth.helpers");
const { signToken } = require('../helpers/jwt.helper');

// render staff login page
const renderLogin = (req, res) => {
  res.render("staff-login");
};

// staff login (email + password)
async function staffLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and password required");
    }

    const user = await User.findOne({ email, role: "STAFF" });
    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).send("Invalid credentials");
    }

    const token = signToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    // If browser form login, redirect to dashboard
    if (req.headers.accept?.includes('text/html')) {
      return res.redirect('/api/staff/dashboard');
    }
    res.status(200).json({ message: 'Staff logged in' });
  } catch (err) {
    console.error('staffLogin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// staff logout
function staffLogout(req, res) {
  res.clearCookie('token');
  if (req.headers.accept?.includes('text/html')) {
    return res.redirect('/api/auth/staff/login');
  }
  res.status(200).json({ message: 'Logged out' });
}

module.exports = {
  renderLogin,
  staffLogin,
  staffLogout,
};
