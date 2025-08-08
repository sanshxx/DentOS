const express = require('express');
const { getDashboardData } = require('../controllers/dashboard');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Dashboard routes
router.route('/').get(getDashboardData);

module.exports = router;