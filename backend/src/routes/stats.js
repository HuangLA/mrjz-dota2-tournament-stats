const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// 总体统计
router.get('/overview', statsController.getOverview);

// 联赛统计
router.get('/league/:id', statsController.getLeagueStats);

module.exports = router;
