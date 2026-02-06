const express = require("express");
const router = express.Router();
const {
  renderLogin,
  staffLogin 
} = require("../controllers/staff.auth");

router.route('/login')
  .get(renderLogin)
  .post(staffLogin);

module.exports = router;
