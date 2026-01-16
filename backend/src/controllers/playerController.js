const { Player, MatchPlayer, Match, Achievement } = require('../models');
const { createPaginatedResponse } = require('../middleware/pagination');
const { Op } = require('sequelize');

class PlayerController {
    /**
     * 获取选手列表
     * GET /api/players?page=1&limit=10
     */
    async getPlayers(req, res, next) {
        try {
            const { page, limit, offset } = req.pagination;

            const { count, rows } = await Player.findAndCountAll({
                limit,
                offset,
                order: [['total_matches', 'DESC']],
                attributes: [
                    'player_id',
                    'steam_id',
                    'nickname',
                    'avatar_url',
                    'total_matches',
                    'total_wins',
                    'avg_kda'
                ]
            });

            res.json(createPaginatedResponse(rows, count, page, limit));
        } catch (error) {
            next(error);
        }
    }

    /**
     * 获取选手详情
     * GET /api/players/:id
     */
    async getPlayerById(req, res, next) {
        try {
            const { id } = req.params;

            const player = await Player.findByPk(id);

            if (!player) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: '选手不存在'
                    }
                });
            }

            res.json({
                success: true,
                data: player
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 获取选手比赛历史
     * GET /api/players/:id/matches?page=1&limit=10
     */
    async getPlayerMatches(req, res, next) {
        try {
            const { id } = req.params;
            const { page, limit, offset } = req.pagination;

            const player = await Player.findByPk(id);
            if (!player) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: '选手不存在'
                    }
                });
            }

            const { count, rows } = await MatchPlayer.findAndCountAll({
                where: { player_id: id },
                include: [
                    {
                        model: Match,
                        as: 'Match',
                        attributes: [
                            'match_id',
                            'league_id',
                            'start_time',
                            'duration',
                            'radiant_win',
                            'radiant_score',
                            'dire_score'
                        ]
                    }
                ],
                limit,
                offset,
                order: [[{ model: Match, as: 'Match' }, 'start_time', 'DESC']]
            });

            res.json(createPaginatedResponse(rows, count, page, limit));
        } catch (error) {
            next(error);
        }
    }

    /**
     * 获取选手成就列表
     * GET /api/players/:id/achievements
     */
    async getPlayerAchievements(req, res, next) {
        try {
            const { id } = req.params;

            const player = await Player.findByPk(id);
            if (!player) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: '选手不存在'
                    }
                });
            }

            const achievements = await Achievement.findAll({
                where: { player_id: id },
                include: [
                    {
                        model: Match,
                        as: 'Match',
                        attributes: ['match_id', 'start_time']
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            res.json({
                success: true,
                data: achievements
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 获取选手统计数据
     * GET /api/players/:id/stats
     */
    async getPlayerStats(req, res, next) {
        try {
            const { id } = req.params;

            const player = await Player.findByPk(id);
            if (!player) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: '选手不存在'
                    }
                });
            }

            // 获取选手的比赛统计
            const matchStats = await MatchPlayer.findAll({
                where: { player_id: id },
                attributes: [
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('kills')), 'avg_kills'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('deaths')), 'avg_deaths'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('assists')), 'avg_assists'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('gpm')), 'avg_gpm'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('xpm')), 'avg_xpm'],
                    [MatchPlayer.sequelize.fn('MAX', MatchPlayer.sequelize.col('kills')), 'max_kills'],
                    [MatchPlayer.sequelize.fn('COUNT', MatchPlayer.sequelize.col('id')), 'total_games']
                ],
                raw: true
            });

            // 获取成就统计
            const achievementStats = await Achievement.findAll({
                where: { player_id: id },
                attributes: [
                    'achievement_type',
                    [Achievement.sequelize.fn('COUNT', '*'), 'count']
                ],
                group: ['achievement_type'],
                raw: true
            });

            res.json({
                success: true,
                data: {
                    player,
                    matchStats: matchStats[0],
                    achievements: achievementStats
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PlayerController();
