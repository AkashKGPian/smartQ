const express = require('express');
const router = express.Router();
const {
  isAuthenticated,
  requireStaff,
} = require('../middleware/auth.middleware');

const {
  staffDashboard,
  pauseQueue,
  resumeQueue,
} = require('../controllers/staff.controller');

router.get(
  '/dashboard',
  isAuthenticated,
  requireStaff,
  staffDashboard
);

router.post(
  '/queue/:queueId/pause',
  isAuthenticated,
  requireStaff,
  pauseQueue
);

router.post(
  '/queue/:queueId/resume',
  isAuthenticated,
  requireStaff,
  resumeQueue
);

module.exports = router;
