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
            const { league_id } = req.query;

            // 构建基础 SQL 查询
            let whereClause = '';
            const replacements = {};

            if (league_id) {
                whereClause = 'WHERE m.league_id = :league_id';
                replacements.league_id = league_id;
            }

            // 1. 获取总记录数
            const countSql = `
                SELECT COUNT(DISTINCT mp.player_id) as total
                FROM match_players mp
                JOIN matches m ON mp.match_id = m.match_id
                ${whereClause}
            `;
            const countResult = await MatchPlayer.sequelize.query(countSql, {
                replacements,
                type: MatchPlayer.sequelize.QueryTypes.SELECT
            });
            const total = countResult[0].total;

            // 2. 获取聚合数据
            // 注意：deaths 为 0 时 KDA Ratio 处理
            const sql = `
                SELECT 
                    p.player_id, 
                    p.steam_id, 
                    p.nickname, 
                    p.avatar_url,
                    COUNT(mp.match_id) as matches_count,
                    SUM(CASE WHEN (mp.team = 'radiant' AND m.radiant_win = 1) OR (mp.team = 'dire' AND m.radiant_win = 0) THEN 1 ELSE 0 END) as wins,
                    AVG(mp.kills) as avg_kills,
                    AVG(mp.deaths) as avg_deaths,
                    AVG(mp.assists) as avg_assists,
                    AVG(mp.gpm) as avg_gpm,
                    AVG(mp.xpm) as avg_xpm,
                    AVG(mp.net_worth) as avg_net_worth,
                    AVG(mp.last_hits) as avg_last_hits,
                    AVG(mp.denies) as avg_denies,
                    AVG(mp.hero_damage) as avg_hero_damage,
                    AVG(mp.damage_taken) as avg_damage_taken,
                    (SUM(mp.kills) + SUM(mp.assists)) / NULLIF(SUM(mp.deaths), 0) as kda_ratio,
                    SUBSTRING_INDEX(GROUP_CONCAT(NULLIF(CASE WHEN mp.team = 'radiant' THEN m.radiant_team_name ELSE m.dire_team_name END, '') ORDER BY m.start_time DESC SEPARATOR '|||'), '|||', 1) as team_name
                FROM match_players mp
                JOIN matches m ON mp.match_id = m.match_id
                LEFT JOIN players p ON mp.player_id = p.player_id
                ${whereClause}
                GROUP BY mp.player_id, p.player_id
                ORDER BY matches_count DESC
                LIMIT :limit OFFSET :offset
            `;

            const rows = await MatchPlayer.sequelize.query(sql, {
                replacements: { ...replacements, limit: parseInt(limit), offset: parseInt(offset) },
                type: MatchPlayer.sequelize.QueryTypes.SELECT
            });

            // 后处理数据（格式化数字等）
            const processedRows = rows.map(row => ({
                ...row,
                win_rate: row.matches_count > 0 ? (row.wins / row.matches_count) * 100 : 0,
                kda_ratio: row.kda_ratio === null ? (parseFloat(row.avg_kills) + parseFloat(row.avg_assists)) : parseFloat(row.kda_ratio)
            }));

            res.json(createPaginatedResponse(processedRows, total, page, limit));
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
