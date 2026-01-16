import apiClient from './axios';

/**
 * 触发比赛同步
 * @param {number} leagueId - 联赛ID
 */
export const triggerSync = (leagueId) => {
    return apiClient.post(`/sync/matches?league_id=${leagueId}`);
};
