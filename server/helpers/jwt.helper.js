const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

function ensureSecret() {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Set JWT_SECRET in your environment or .env file');
  }
}

function signToken(user) {
  ensureSecret();
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  ensureSecret();
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  signToken,
  verifyToken,
};
