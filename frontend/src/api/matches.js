import apiClient from './axios';

/**
 * 获取比赛列表
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @param {number} leagueId - 联赛ID (可选)
 */
export const getMatches = (page = 1, limit = 20, leagueId = null) => {
    const params = { page, limit };
    if (leagueId) {
        params.league_id = leagueId;
    }
    return apiClient.get('/matches', { params });
};

/**
 * 获取比赛详情
 * @param {number} matchId - 比赛ID
 */
export const getMatchById = (matchId) => {
    return apiClient.get(`/matches/${matchId}`);
};

/**
 * 获取比赛选手列表
 * @param {number} matchId - 比赛ID
 */
export const getMatchPlayers = (matchId) => {
    return apiClient.get(`/matches/${matchId}/players`);
};

/**
 * 获取比赛成就列表
 * @param {number} matchId - 比赛ID
 */
export const getMatchAchievements = (matchId) => {
    return apiClient.get(`/matches/${matchId}/achievements`);
};
