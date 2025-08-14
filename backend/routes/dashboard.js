const express = require('express');
const { getDashboardData } = require('../controllers/dashboard');
const { protect } = require('../middleware/auth');
const clinicScope = require('../middleware/clinicScope');

const router = express.Router();

// Protect all routes
router.use(protect, clinicScope);

// Dashboard routes
router.route('/').get(getDashboardData);

module.exports = router;