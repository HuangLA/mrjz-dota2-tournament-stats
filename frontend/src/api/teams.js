import apiClient from './axios';

/**
 * 获取所有战队列表
 * @param {number} leagueId - 联赛ID（可选）
 */
export const getTeams = (leagueId = null) => {
    const params = leagueId ? { league_id: leagueId } : {};
    return apiClient.get('/teams', { params });
};

/**
 * 获取战队成员列表
 * @param {number} teamId - 战队ID
 * @param {number} leagueId - 联赛ID（可选）
 */
export const getTeamPlayers = (teamId, leagueId = null) => {
    const params = leagueId ? { league_id: leagueId } : {};
    return apiClient.get(`/teams/${teamId}/players`, { params });
};

/**
 * 获取战队比赛记录
 * @param {number} teamId - 战队ID
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @param {number} leagueId - 联赛ID（可选）
 */
export const getTeamMatches = (teamId, page = 1, limit = 20, leagueId = null) => {
    const params = { page, limit };
    if (leagueId) {
        params.league_id = leagueId;
    }
    return apiClient.get(`/teams/${teamId}/matches`, { params });
};
