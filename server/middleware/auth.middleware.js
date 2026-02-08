const { verifyToken } = require('../helpers/jwt.helper');
const User = require('../models/User');

async function isAuthenticated(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      // Redirect browser users to the appropriate login page
      if (req.headers.accept?.includes('text/html')) {
        return res.redirect('/api/auth/patient/login');
      }
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.id).select('-passwordHash');

    if (!user) {
      if (req.headers.accept?.includes('text/html')) {
        return res.redirect('/api/auth/patient/login');
      }
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (req.headers.accept?.includes('text/html')) {
      res.clearCookie('token');
      return res.redirect('/api/auth/patient/login');
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requirePatient(req, res, next) {
  if (req.user.role !== 'PATIENT') {
    return res.status(403).json({ error: 'Patient access only' });
  }
  next();
}

function requireStaff(req, res, next) {
  if (req.user.role !== 'STAFF') {
    return res.status(403).json({ error: 'Staff access only' });
  }
  next();
}

module.exports = {
  isAuthenticated,
  requirePatient,
  requireStaff,
};
