const { Achievement, Player, Match } = require('../models');
const { createPaginatedResponse } = require('../middleware/pagination');

class AchievementController {
    /**
     * 获取成就列表
     * GET /api/achievements?page=1&limit=10&type=rampage
     */
    async getAchievements(req, res, next) {
        try {
            const { page, limit, offset } = req.pagination;
            const { type } = req.query;

            const where = {};
            if (type) {
                where.achievement_type = type;
            }

            const { count, rows } = await Achievement.findAndCountAll({
                where,
                include: [
                    {
                        model: Player,
                        as: 'Player',
                        attributes: ['player_id', 'steam_id', 'nickname', 'avatar_url'],
                        required: false
                    },
                    {
                        model: Match,
                        as: 'Match',
                        attributes: ['match_id', 'start_time', 'league_id']
                    }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']]
            });

            res.json(createPaginatedResponse(rows, count, page, limit));
        } catch (error) {
            next(error);
        }
    }

    /**
     * 获取成就统计
     * GET /api/achievements/stats
     */
    async getAchievementStats(req, res, next) {
        try {
            // 按类型统计
            const byType = await Achievement.findAll({
                attributes: [
                    'achievement_type',
                    'achievement_name',
                    [Achievement.sequelize.fn('COUNT', '*'), 'count']
                ],
                group: ['achievement_type', 'achievement_name'],
                order: [[Achievement.sequelize.fn('COUNT', '*'), 'DESC']],
                raw: true
            });

            // 总数统计
            const total = await Achievement.count();

            // 最近成就
            const recent = await Achievement.findAll({
                include: [
                    {
                        model: Player,
                        as: 'Player',
                        attributes: ['player_id', 'steam_id', 'nickname'],
                        required: false
                    },
                    {
                        model: Match,
                        as: 'Match',
                        attributes: ['match_id', 'start_time']
                    }
                ],
                limit: 10,
                order: [['created_at', 'DESC']]
            });

            res.json({
                success: true,
                data: {
                    total,
                    byType,
                    recent
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AchievementController();
