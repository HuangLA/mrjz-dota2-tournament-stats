const { sequelize } = require('../config/database');

class TeamController {
    /**
     * 获取所有战队列表及统计（包含成员）
     * GET /api/teams
     */
    async getTeams(req, res, next) {
        try {
            const { league_id } = req.query;

            // 构建 WHERE 条件
            let leagueFilter = '';
            if (league_id) {
                leagueFilter = `AND m.league_id = ${parseInt(league_id)}`;
            }

            // 聚合天辉和夜魇的战队统计
            const [teams] = await sequelize.query(`
                SELECT 
                    team_id,
                    team_name,
                    MAX(team_logo_url) as team_logo_url,
                    SUM(total_matches) as total_matches,
                    SUM(wins) as wins,
                    SUM(losses) as losses,
                    ROUND(SUM(wins) * 100.0 / SUM(total_matches), 2) as win_rate
                FROM (
                    SELECT 
                        m.radiant_team_id as team_id,
                        m.radiant_team_name as team_name,
                        m.radiant_team_logo_url as team_logo_url,
                        COUNT(*) as total_matches,
                        SUM(CASE WHEN m.radiant_win = 1 THEN 1 ELSE 0 END) as wins,
                        SUM(CASE WHEN m.radiant_win = 0 THEN 1 ELSE 0 END) as losses
                    FROM matches m
                    WHERE m.radiant_team_id IS NOT NULL AND m.radiant_team_name IS NOT NULL ${leagueFilter}
                    GROUP BY m.radiant_team_id, m.radiant_team_name, m.radiant_team_logo_url
                    
                    UNION ALL
                    
                    SELECT 
                        m.dire_team_id as team_id,
                        m.dire_team_name as team_name,
                        m.dire_team_logo_url as team_logo_url,
                        COUNT(*) as total_matches,
                        SUM(CASE WHEN m.radiant_win = 0 THEN 1 ELSE 0 END) as wins,
                        SUM(CASE WHEN m.radiant_win = 1 THEN 1 ELSE 0 END) as losses
                    FROM matches m
                    WHERE m.dire_team_id IS NOT NULL AND m.dire_team_name IS NOT NULL ${leagueFilter}
                    GROUP BY m.dire_team_id, m.dire_team_name, m.dire_team_logo_url
                ) combined
                GROUP BY team_id, team_name
                HAVING SUM(total_matches) > 0
                ORDER BY total_matches DESC, win_rate DESC
            `);

            // 为每个战队获取成员列表
            for (const team of teams) {
                const [players] = await sequelize.query(`
                    SELECT DISTINCT 
                        p.player_id,
                        p.steam_id,
                        p.nickname,
                        p.avatar_url,
                        COUNT(DISTINCT mp.match_id) as matches_played
                    FROM match_players mp
                    JOIN players p ON mp.player_id = p.player_id
                    JOIN matches m ON mp.match_id = m.match_id
                    WHERE ((m.radiant_team_id = ? AND mp.team = 'radiant')
                       OR (m.dire_team_id = ? AND mp.team = 'dire'))
                       ${leagueFilter}
                    GROUP BY p.player_id, p.steam_id, p.nickname, p.avatar_url
                    ORDER BY matches_played DESC
                `, {
                    replacements: [team.team_id, team.team_id]
                });

                team.players = players;
            }

            res.json({
                success: true,
                data: teams
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 获取战队成员列表
     * GET /api/teams/:id/players
     */
    async getTeamPlayers(req, res, next) {
        try {
            const { id } = req.params;
            const { league_id } = req.query;

            let leagueFilter = '';
            if (league_id) {
                leagueFilter = `AND m.league_id = ${parseInt(league_id)}`;
            }

            const [players] = await sequelize.query(`
                SELECT DISTINCT 
                    p.player_id,
                    p.steam_id,
                    p.nickname,
                    p.avatar_url,
                    COUNT(DISTINCT mp.match_id) as matches_played
                FROM match_players mp
                JOIN players p ON mp.player_id = p.player_id
                JOIN matches m ON mp.match_id = m.match_id
                WHERE ((m.radiant_team_id = ? AND mp.team = 'radiant')
                   OR (m.dire_team_id = ? AND mp.team = 'dire'))
                   ${leagueFilter}
                GROUP BY p.player_id, p.steam_id, p.nickname, p.avatar_url
                ORDER BY matches_played DESC
            `, {
                replacements: [id, id]
            });

            // 异步触发未同步玩家的昵称同步
            const unsyncedPlayers = players.filter(p =>
                p.nickname && p.nickname.startsWith('Player_')
            );

            if (unsyncedPlayers.length > 0) {
                const playerIds = unsyncedPlayers.map(p => p.player_id);
                const { syncPlayerNicknames } = require('../services/playerService');
                const { getSteamApiKey } = require('../config/steam');

                // 异步执行，不阻塞响应
                getSteamApiKey().then(apiKey => {
                    if (apiKey) {
                        syncPlayerNicknames(playerIds, sequelize, apiKey).catch(err => {
                            console.error('Background player sync error:', err);
                        });
                    }
                });
            }

            res.json({
                success: true,
                data: players
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 获取战队比赛记录
     * GET /api/teams/:id/matches
     */
    async getTeamMatches(req, res, next) {
        try {
            const { id } = req.params;
            const { league_id, page = 1, limit = 20 } = req.query;

            const teamId = parseInt(id);
            const currentPage = parseInt(page);
            const pageSize = parseInt(limit);
            const offset = (currentPage - 1) * pageSize;

            // 构建 WHERE 条件
            let leagueFilter = '';
            if (league_id) {
                leagueFilter = `AND m.league_id = ${parseInt(league_id)}`;
            }

            // 获取战队信息和统计
            const [teamStats] = await sequelize.query(`
                SELECT 
                    team_id,
                    team_name,
                    MAX(team_logo_url) as team_logo_url,
                    SUM(total_matches) as total_matches,
                    SUM(wins) as wins,
                    SUM(losses) as losses,
                    ROUND(SUM(wins) * 100.0 / SUM(total_matches), 2) as win_rate
                FROM (
                    SELECT 
                        m.radiant_team_id as team_id,
                        m.radiant_team_name as team_name,
                        m.radiant_team_logo_url as team_logo_url,
                        COUNT(*) as total_matches,
                        SUM(CASE WHEN m.radiant_win = 1 THEN 1 ELSE 0 END) as wins,
                        SUM(CASE WHEN m.radiant_win = 0 THEN 1 ELSE 0 END) as losses
                    FROM matches m
                    WHERE m.radiant_team_id = ? ${leagueFilter}
                    GROUP BY m.radiant_team_id, m.radiant_team_name, m.radiant_team_logo_url
                    
                    UNION ALL
                    
                    SELECT 
                        m.dire_team_id as team_id,
                        m.dire_team_name as team_name,
                        m.dire_team_logo_url as team_logo_url,
                        COUNT(*) as total_matches,
                        SUM(CASE WHEN m.radiant_win = 0 THEN 1 ELSE 0 END) as wins,
                        SUM(CASE WHEN m.radiant_win = 1 THEN 1 ELSE 0 END) as losses
                    FROM matches m
                    WHERE m.dire_team_id = ? ${leagueFilter}
                    GROUP BY m.dire_team_id, m.dire_team_name, m.dire_team_logo_url
                ) combined
                GROUP BY team_id, team_name
            `, {
                replacements: [teamId, teamId]
            });

            if (teamStats.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Team not found'
                });
            }

            const team = teamStats[0];

            // 获取战队成员
            const [players] = await sequelize.query(`
                SELECT DISTINCT 
                    p.player_id,
                    p.steam_id,
                    p.nickname,
                    p.avatar_url,
                    COUNT(DISTINCT mp.match_id) as matches_played
                FROM match_players mp
                JOIN players p ON mp.player_id = p.player_id
                JOIN matches m ON mp.match_id = m.match_id
                WHERE ((m.radiant_team_id = ? AND mp.team = 'radiant')
                   OR (m.dire_team_id = ? AND mp.team = 'dire'))
                   ${leagueFilter}
                GROUP BY p.player_id, p.steam_id, p.nickname, p.avatar_url
                ORDER BY matches_played DESC
            `, {
                replacements: [teamId, teamId]
            });

            team.players = players;

            // 获取比赛总数
            const [countResult] = await sequelize.query(`
                SELECT COUNT(*) as total
                FROM matches m
                WHERE (m.radiant_team_id = ? OR m.dire_team_id = ?)
                ${leagueFilter}
            `, {
                replacements: [teamId, teamId]
            });

            const total = countResult[0].total;

            // 获取比赛列表
            const [matches] = await sequelize.query(`
                SELECT 
                    m.*,
                    CASE 
                        WHEN m.radiant_team_id = ? THEN m.dire_team_name
                        ELSE m.radiant_team_name
                    END as opponent_name,
                    CASE 
                        WHEN m.radiant_team_id = ? THEN m.radiant_win
                        ELSE NOT m.radiant_win
                    END as is_win
                FROM matches m
                WHERE (m.radiant_team_id = ? OR m.dire_team_id = ?)
                ${leagueFilter}
                ORDER BY m.start_time DESC
                LIMIT ? OFFSET ?
            `, {
                replacements: [teamId, teamId, teamId, teamId, pageSize, offset]
            });

            res.json({
                success: true,
                data: {
                    team,
                    matches
                },
                pagination: {
                    page: currentPage,
                    limit: pageSize,
                    total: total,
                    totalPages: Math.ceil(total / pageSize)
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TeamController();
