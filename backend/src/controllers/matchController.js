const { Match, Player, MatchPlayer, Achievement } = require('../models');
const { createPaginatedResponse } = require('../middleware/pagination');
const { sequelize } = require('../config/database');
const syncService = require('../services/syncService');

class MatchController {
    /**
     * 获取比赛列表
     * GET /api/matches?page=1&limit=10&league_id=17485
     */
    async getMatches(req, res, next) {
        try {
            const { page, limit, offset } = req.pagination;
            const { league_id } = req.query;

            const where = {};
            if (league_id) {
                where.league_id = league_id;
            }

            const { count, rows } = await Match.findAndCountAll({
                where,
                limit,
                offset,
                order: [['start_time', 'DESC']],
                attributes: [
                    'match_id',
                    'league_id',
                    'start_time',
                    'duration',
                    'radiant_win',
                    'radiant_score',
                    'dire_score',
                    'radiant_team_id',
                    'radiant_team_name',
                    'dire_team_id',
                    'dire_team_name',
                    'game_mode',

                    'parse_requested',
                    'is_parsed',
                    'parse_requested_at'
                ],
                include: [
                    {
                        model: MatchPlayer,
                        as: 'players',
                        attributes: ['hero_id', 'team'],
                        required: false
                    }
                ],
                distinct: true,  // 修复：使用 distinct 避免 include 导致的 count 错误
                col: 'match_id'  // 修复：指定按 match_id 去重计数
            });

            res.json(createPaginatedResponse(rows, count, page, limit));
        } catch (error) {
            next(error);
        }
    }

    /**
     * 获取比赛详情
     * GET /api/matches/:id
     */
    async getMatchById(req, res, next) {
        try {
            const { id } = req.params;

            const match = await Match.findByPk(id, {
                include: [
                    {
                        model: MatchPlayer,
                        as: 'players',
                        include: [
                            {
                                model: Player,
                                as: 'Player',
                                attributes: ['player_id', 'steam_id', 'nickname', 'avatar_url']
                            }
                        ]
                    }
                ]
            });

            if (!match) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: '比赛不存在'
                    }
                });
            }

            // 查询乐邦詹士成就（唯一成就）
            const lebronAchievements = await Achievement.findAll({
                where: {
                    match_id: id,
                    achievement_type: 'lebron_james',
                    is_unique: true
                },
                attributes: ['player_id']
            });

            // 创建玩家ID到成就的映射
            const lebronPlayerIds = new Set(lebronAchievements.map(a => a.player_id));

            // 为每个玩家添加 has_lebron_achievement 字段
            const matchData = match.toJSON();
            if (matchData.players) {
                matchData.players = matchData.players.map(player => ({
                    ...player,
                    has_lebron_achievement: lebronPlayerIds.has(player.player_id)
                }));
            }

            res.json({
                success: true,
                data: matchData
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 获取比赛选手列表
     * GET /api/matches/:id/players
     */
    async getMatchPlayers(req, res, next) {
        try {
            const { id } = req.params;

            const match = await Match.findByPk(id);
            if (!match) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: '比赛不存在'
                    }
                });
            }

            const players = await MatchPlayer.findAll({
                where: { match_id: id },
                include: [
                    {
                        model: Player,
                        as: 'Player',
                        attributes: ['player_id', 'steam_id', 'nickname', 'avatar_url']
                    }
                ],
                order: [['team', 'ASC'], ['id', 'ASC']]  // 按队伍和ID排序
            });

            res.json({
                success: true,
                data: players
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 获取比赛成就列表
     * GET /api/matches/:id/achievements
     */
    async getMatchAchievements(req, res, next) {
        try {
            const { id } = req.params;

            const match = await Match.findByPk(id);
            if (!match) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: '比赛不存在'
                    }
                });
            }

            const achievements = await Achievement.findAll({
                where: { match_id: id },
                include: [
                    {
                        model: Player,
                        as: 'Player',
                        attributes: ['player_id', 'steam_id', 'nickname', 'avatar_url'],
                        required: false
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
     * 强制刷新比赛数据
     * POST /api/matches/force-refresh?league_id=18365
     */
    async forceRefreshMatches(req, res, next) {
        try {
            const { league_id } = req.query;

            // 验证 league_id 参数
            if (!league_id) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_PARAMETER',
                        message: 'league_id 参数是必需的'
                    }
                });
            }

            const leagueId = parseInt(league_id);
            if (isNaN(leagueId)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_PARAMETER',
                        message: 'league_id 必须是有效的数字'
                    }
                });
            }

            console.log(`🔄 Force refresh request for league ${leagueId}`);

            // 调用 syncService 的强制刷新方法
            const result = await syncService.forceRefreshMatches(leagueId);

            res.json({
                success: true,
                data: {
                    message: '强制刷新完成',
                    deleted: result.deleted,
                    synced: result.synced,
                    total: result.total,
                    duration: result.duration
                }
            });
        } catch (error) {
            console.error('Force refresh error:', error);
            next(error);
        }
    }

    /**
     * 请求OpenDota解析比赛
     * POST /api/matches/:matchId/request-parse
     */
    async requestParse(req, res, next) {
        try {
            const { matchId } = req.params;

            // 查找比赛
            const match = await Match.findByPk(matchId);
            if (!match) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: '比赛不存在'
                    }
                });
            }

            // 检查是否已请求解析
            if (match.parse_requested) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'ALREADY_REQUESTED',
                        message: '已经请求过解析，请稍后刷新数据'
                    }
                });
            }

            // 调用OpenDota API请求解析
            const axios = require('axios');
            try {
                const response = await axios.post(`https://api.opendota.com/api/request/${matchId}`);
                console.log(`✅ Requested parse for match ${matchId}:`, response.data);

                // 更新数据库
                await match.update({
                    parse_requested: true,
                    parse_requested_at: new Date()
                });

                res.json({
                    success: true,
                    data: {
                        message: '已请求OpenDota解析比赛，请稍后刷新数据',
                        jobId: response.data.job?.jobId
                    }
                });
            } catch (apiError) {
                console.error('OpenDota API error:', apiError.response?.data || apiError.message);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'OPENDOTA_ERROR',
                        message: 'OpenDota API请求失败',
                        details: apiError.response?.data || apiError.message
                    }
                });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * 刷新比赛数据
     * POST /api/matches/:matchId/refresh
     */
    async refreshMatch(req, res, next) {
        try {
            const { matchId } = req.params;

            // 查找比赛
            const match = await Match.findByPk(matchId);
            if (!match) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: '比赛不存在'
                    }
                });
            }

            // 调用syncService重新同步这场比赛
            console.log(`🔄 Refreshing match ${matchId}...`);
            const result = await syncService.syncSingleMatch(matchId);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'SYNC_FAILED',
                        message: result.error || '刷新失败'
                    }
                });
            }

            // 重新获取更新后的比赛数据
            const updatedMatch = await Match.findByPk(matchId, {
                include: [
                    {
                        model: MatchPlayer,
                        as: 'players',
                        include: [
                            {
                                model: Player,
                                as: 'Player',
                                attributes: ['player_id', 'steam_id', 'nickname', 'avatar_url']
                            }
                        ]
                    }
                ]
            });

            res.json({
                success: true,
                data: {
                    message: '比赛数据已刷新',
                    match: updatedMatch,
                    isParsed: updatedMatch.is_parsed
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MatchController();
