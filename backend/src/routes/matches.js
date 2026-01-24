const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { pagination } = require('../middleware/pagination');

// 比赛列表（带分页）
router.get('/', pagination, matchController.getMatches);

// 强制刷新比赛数据（管理功能）
router.post('/force-refresh', matchController.forceRefreshMatches);

// 比赛详情
router.get('/:id', matchController.getMatchById);

// 比赛选手列表
router.get('/:id/players', matchController.getMatchPlayers);

// 比赛成就列表
router.get('/:id/achievements', matchController.getMatchAchievements);

// 请求OpenDota解析比赛
router.post('/:matchId/request-parse', matchController.requestParse);

// 刷新比赛数据
router.post('/:matchId/refresh', matchController.refreshMatch);

module.exports = router;
