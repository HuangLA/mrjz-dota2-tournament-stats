/**
 * 战队相关路由
 */
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

/**
 * GET /api/teams
 * 获取所有战队列表
 */
router.get('/', teamController.getTeams.bind(teamController));

/**
 * GET /api/teams/:id/players
 * 获取战队成员列表
 */
router.get('/:id/players', teamController.getTeamPlayers.bind(teamController));

/**
 * GET /api/teams/:id/matches
 * 获取战队比赛记录
 */
router.get('/:id/matches', teamController.getTeamMatches.bind(teamController));

module.exports = router;
