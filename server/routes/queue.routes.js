const express = require('express');
const router = express.Router();
const {
  isAuthenticated,
  requirePatient,
} = require('../middleware/auth.middleware');
const { joinQueue, cancelToken } = require('../controllers/queue.controller');

router.post(
  '/join',
  isAuthenticated,
  requirePatient,
  joinQueue
);

// DELETE for API clients, POST for browser forms (forms can't send DELETE)
router.delete('/cancel/:tokenId', isAuthenticated, requirePatient, cancelToken);
router.post('/cancel/:tokenId', isAuthenticated, requirePatient, cancelToken);

module.exports = router;
