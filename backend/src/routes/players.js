const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { pagination } = require('../middleware/pagination');

// 选手列表（带分页）
router.get('/', pagination, playerController.getPlayers);

// 选手详情
router.get('/:id', playerController.getPlayerById);

// 选手比赛历史（带分页）
router.get('/:id/matches', pagination, playerController.getPlayerMatches);

// 选手成就列表
router.get('/:id/achievements', playerController.getPlayerAchievements);

// 选手统计数据
router.get('/:id/stats', playerController.getPlayerStats);

module.exports = router;
