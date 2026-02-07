const express = require("express");
const router = express.Router();
const {
  renderLogin,
  staffLogin,
  staffLogout,
} = require("../controllers/staff.auth");

router.route('/login')
  .get(renderLogin)
  .post(staffLogin);

router.get('/logout', staffLogout);

module.exports = router;
