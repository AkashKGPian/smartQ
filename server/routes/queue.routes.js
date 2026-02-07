const express = require('express');
const router = express.Router();
const {
  isAuthenticated,
  requirePatient,
} = require('../middleware/auth.middleware');
const { joinQueue } = require('../controllers/queue.controller');

router.post(
  '/join',
  isAuthenticated,
  requirePatient,
  joinQueue
);

module.exports = router;
