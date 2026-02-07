const express = require('express');
const router = express.Router();
const {
  isAuthenticated,
  requireStaff,
} = require('../middleware/auth.middleware');
const {
  callNextToken,
  completeToken,
} = require('../controllers/token.controller');

router.post(
  '/call-next',
  isAuthenticated,
  requireStaff,
  async (req, res) => {
    try {
      const token = await callNextToken(req.body.queueId);
      if (!token) {
        // If browser, redirect back with no action
        if (req.headers.accept?.includes('text/html')) {
          return res.redirect('/api/staff/dashboard');
        }
        return res.status(404).json({ error: 'No waiting tokens' });
      }
      // If browser form submission, redirect back to dashboard
      if (req.headers.accept?.includes('text/html')) {
        return res.redirect('/api/staff/dashboard');
      }
      res.status(200).json(token);
    } catch (err) {
      console.error('callNextToken error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.patch(
  '/:tokenId/complete',
  isAuthenticated,
  requireStaff,
  async (req, res) => {
    try {
      const token = await completeToken(req.params.tokenId, req.body.status);
      if (!token) {
        return res.status(404).json({ error: 'Token not found' });
      }
      // If browser form submission, redirect back to dashboard
      if (req.headers.accept?.includes('text/html')) {
        return res.redirect('/api/staff/dashboard');
      }
      res.status(200).json(token);
    } catch (err) {
      console.error('completeToken error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST override for browsers (forms can't PATCH)
router.post(
  '/:tokenId/complete',
  isAuthenticated,
  requireStaff,
  async (req, res) => {
    try {
      const token = await completeToken(req.params.tokenId, req.body.status);
      if (!token) {
        if (req.headers.accept?.includes('text/html')) {
          return res.redirect('/api/staff/dashboard');
        }
        return res.status(404).json({ error: 'Token not found' });
      }
      if (req.headers.accept?.includes('text/html')) {
        return res.redirect('/api/staff/dashboard');
      }
      res.status(200).json(token);
    } catch (err) {
      console.error('completeToken error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
