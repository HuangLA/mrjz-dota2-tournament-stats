const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

/**
 * @route   GET /api/sync/status
 * @desc    获取当前同步状态
 * @access  Public
 */
router.get('/status', syncController.getSyncStatus);

/**
 * @route   POST /api/sync/trigger
 * @desc    触发数据同步
 * @access  Public
 */
router.post('/trigger', syncController.triggerSync);

module.exports = router;
