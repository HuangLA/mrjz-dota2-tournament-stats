import apiClient from './axios';

/**
 * 获取同步状态
 */
export const getSyncStatus = async () => {
    return apiClient.get('/sync/status');
};

/**
 * 触发同步
 */
export const triggerSync = async (leagueId) => {
    return apiClient.post(`/sync/trigger?league_id=${leagueId}`);
};
