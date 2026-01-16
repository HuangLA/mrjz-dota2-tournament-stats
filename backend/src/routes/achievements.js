const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { pagination } = require('../middleware/pagination');

// 成就列表（带分页和类型过滤）
router.get('/', pagination, achievementController.getAchievements);

// 成就统计
router.get('/stats', achievementController.getAchievementStats);

module.exports = router;
