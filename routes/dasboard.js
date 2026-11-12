const express = require('express');
const router = express.Router();
const dashboardHandler = require('../controllers/dashboardHandler');

router.get('/data', dashboardHandler.getDashboardData);

module.exports = router;
