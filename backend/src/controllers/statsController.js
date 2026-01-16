const { Match, Player, MatchPlayer, Achievement } = require('../models');

class StatsController {
    /**
     * 获取总体统计
     * GET /api/stats/overview
     */
    async getOverview(req, res, next) {
        try {
            // 基础统计
            const totalMatches = await Match.count();
            const totalPlayers = await Player.count();
            const totalAchievements = await Achievement.count();

            // 最近比赛
            const recentMatches = await Match.findAll({
                limit: 5,
                order: [['start_time', 'DESC']],
                attributes: [
                    'match_id',
                    'league_id',
                    'start_time',
                    'duration',
                    'radiant_win',
                    'radiant_score',
                    'dire_score'
                ]
            });

            // 胜率统计
            const radiantWins = await Match.count({ where: { radiant_win: true } });
            const winRate = totalMatches > 0 ? (radiantWins / totalMatches * 100).toFixed(2) : 0;

            res.json({
                success: true,
                data: {
                    totalMatches,
                    totalPlayers,
                    totalAchievements,
                    radiantWinRate: winRate,
                    recentMatches
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 获取联赛统计
     * GET /api/stats/league/:id
     */
    async getLeagueStats(req, res, next) {
        try {
            const { id } = req.params;

            // 联赛比赛数
            const totalMatches = await Match.count({
                where: { league_id: id }
            });

            if (totalMatches === 0) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: '联赛不存在或无比赛数据'
                    }
                });
            }

            // 联赛成就统计
            const achievements = await Achievement.findAll({
                include: [
                    {
                        model: Match,
                        as: 'Match',
                        where: { league_id: id },
                        attributes: []
                    }
                ],
                attributes: [
                    'achievement_type',
                    'achievement_name',
                    [Achievement.sequelize.fn('COUNT', '*'), 'count']
                ],
                group: ['achievement_type', 'achievement_name'],
                raw: true
            });

            // 联赛选手统计
            const playerStats = await MatchPlayer.findAll({
                include: [
                    {
                        model: Match,
                        as: 'Match',
                        where: { league_id: id },
                        attributes: []
                    },
                    {
                        model: Player,
                        as: 'Player',
                        attributes: ['player_id', 'steam_id', 'nickname']
                    }
                ],
                attributes: [
                    'player_id',
                    [MatchPlayer.sequelize.fn('COUNT', '*'), 'games'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('kills')), 'avg_kills'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('deaths')), 'avg_deaths'],
                    [MatchPlayer.sequelize.fn('AVG', MatchPlayer.sequelize.col('assists')), 'avg_assists']
                ],
                group: ['player_id', 'Player.player_id', 'Player.steam_id', 'Player.nickname'],
                order: [[MatchPlayer.sequelize.fn('COUNT', '*'), 'DESC']],
                limit: 10,
                raw: false
            });

            res.json({
                success: true,
                data: {
                    leagueId: id,
                    totalMatches,
                    achievements,
                    topPlayers: playerStats
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new StatsController();
