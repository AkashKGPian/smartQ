const express = require('express');
const router = express.Router();
const { isAuthenticated, requirePatient } = require('../middleware/auth.middleware');
const { patientDashboard } = require('../controllers/patient.controller');

/**
 * GET /api/patient/dashboard
 *
 * Protected route — only logged-in patients can access.
 * Renders the patient dashboard (active queues + visit history).
 */
router.get('/dashboard', isAuthenticated, requirePatient, patientDashboard);

module.exports = router;
