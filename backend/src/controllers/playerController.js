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
            // 新增 avg_tower_damage
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
                    AVG(mp.tower_damage) as avg_tower_damage,
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

            // 获取这一页选手的擅长英雄 (Top 3)
            const playerIds = rows.map(r => r.player_id);
            let playerHeroesMap = {};

            if (playerIds.length > 0) {
                // 使用单次查询获取这些选手的所有英雄场次，稍微消耗一点性能但比N次查询好
                // 或者只获取每个选手 Top 3。由于MySQL Group-wise Limit比较麻烦，
                // 这里我们拉取这些选手的所有 {player_id, hero_id, count} 然后在内存处理（假设英雄也就100多个，每个选手数据量不大）
                const heroesSql = `
                    SELECT 
                        mp.player_id, 
                        mp.hero_id, 
                        COUNT(*) as count,
                        SUM(CASE WHEN (mp.team = 'radiant' AND m.radiant_win = 1) OR (mp.team = 'dire' AND m.radiant_win = 0) THEN 1 ELSE 0 END) as wins
                    FROM match_players mp
                    JOIN matches m ON mp.match_id = m.match_id
                    WHERE mp.player_id IN (:playerIds)
                    GROUP BY mp.player_id, mp.hero_id
                    ORDER BY mp.player_id, wins DESC, count DESC
                `;

                const heroesRows = await MatchPlayer.sequelize.query(heroesSql, {
                    replacements: { playerIds },
                    type: MatchPlayer.sequelize.QueryTypes.SELECT
                });

                // 内存中分组取 Top 3
                heroesRows.forEach(row => {
                    if (!playerHeroesMap[row.player_id]) {
                        playerHeroesMap[row.player_id] = [];
                    }
                    if (playerHeroesMap[row.player_id].length < 3) {
                        playerHeroesMap[row.player_id].push(row.hero_id);
                    }
                });
            }

            // 后处理数据（格式化数字等）
            const processedRows = rows.map(row => ({
                ...row,
                win_rate: row.matches_count > 0 ? (row.wins / row.matches_count) * 100 : 0,
                kda_ratio: row.kda_ratio === null ? (parseFloat(row.avg_kills) + parseFloat(row.avg_assists)) : parseFloat(row.kda_ratio),
                signature_heroes: playerHeroesMap[row.player_id] || []
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

            // 获取选手所属战队（逻辑同列表页：查找最近一个非空的战队名）
            const teamNameResult = await MatchPlayer.sequelize.query(`
                SELECT 
                    SUBSTRING_INDEX(GROUP_CONCAT(NULLIF(CASE WHEN mp.team = 'radiant' THEN m.radiant_team_name ELSE m.dire_team_name END, '') ORDER BY m.start_time DESC SEPARATOR '|||'), '|||', 1) as team_name
                FROM match_players mp
                JOIN matches m ON mp.match_id = m.match_id
                WHERE mp.player_id = :id
            `, {
                replacements: { id },
                type: MatchPlayer.sequelize.QueryTypes.SELECT
            });

            const team_name = teamNameResult[0]?.team_name || null;

            // 获取选手的比赛统计
            const matchStats = await MatchPlayer.findAll({
                where: { player_id: id },
                attributes: [
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('kills')), 'avg_kills'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('deaths')), 'avg_deaths'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('assists')), 'avg_assists'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('gpm')), 'avg_gpm'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('xpm')), 'avg_xpm'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('tower_damage')), 'avg_tower_damage'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('hero_damage')), 'avg_hero_damage'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('damage_taken')), 'avg_damage_taken'],
                    [MatchPlayer.sequelize.fn('MAX', MatchPlayer.sequelize.col('kills')), 'max_kills'],
                    [MatchPlayer.sequelize.fn('MAX', MatchPlayer.sequelize.col('tower_damage')), 'max_tower_damage'],
                    [MatchPlayer.sequelize.fn('MAX', MatchPlayer.sequelize.col('hero_damage')), 'max_hero_damage'],
                    [MatchPlayer.sequelize.fn('COUNT', MatchPlayer.sequelize.col('id')), 'total_games']
                ],
                raw: true
            });

            // 获取擅长英雄 (Top 3 by count)
            const heroStats = await MatchPlayer.findAll({
                where: { player_id: id },
                attributes: [
                    'hero_id',
                    [MatchPlayer.sequelize.fn('COUNT', MatchPlayer.sequelize.col('id')), 'matches_count'],
                    [MatchPlayer.sequelize.fn('SUM', MatchPlayer.sequelize.literal("CASE WHEN (team = 'radiant' AND `Match`.`radiant_win` = 1) OR (team = 'dire' AND `Match`.`radiant_win` = 0) THEN 1 ELSE 0 END")), 'wins']
                ],
                include: [{
                    model: Match,
                    as: 'Match', // Use the alias defined in association, assuming 'Match' belongsTo MatchPlayer? No, MatchPlayer belongsTo Match.
                    attributes: [] // We need match data for win calculation
                }],
                group: ['hero_id'],
                order: [
                    [MatchPlayer.sequelize.literal('wins'), 'DESC'],
                    [MatchPlayer.sequelize.literal('matches_count'), 'DESC']
                ],
                limit: 3,
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
                    player: { ...player.toJSON(), team_name },
                    matchStats: matchStats[0],
                    signatureHeroes: heroStats,
                    achievements: achievementStats
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PlayerController();
