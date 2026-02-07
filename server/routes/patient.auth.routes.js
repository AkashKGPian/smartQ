const express = require("express");
const router = express.Router();
const {
  renderSignup,
  signupPatient,
  renderLogin,
  patientLogin,
  patientLogout,
} = require("../controllers/patient.auth");

router.route('/signup')
  .get(renderSignup)
  .post(signupPatient);

router.route('/login')
  .get(renderLogin)
  .post(patientLogin);

router.get('/logout', patientLogout);

module.exports = router;
