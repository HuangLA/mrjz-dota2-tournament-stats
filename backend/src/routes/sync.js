/**
 * 同步相关路由
 */
const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

/**
 * POST /api/sync/matches?league_id=xxx
 * 手动触发比赛同步
 */
router.post('/matches', syncController.syncMatches.bind(syncController));

module.exports = router;
