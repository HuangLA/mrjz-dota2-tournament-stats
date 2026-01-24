import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * 获取同步状态
 */
export const getSyncStatus = async () => {
    const response = await axios.get(`${API_BASE_URL}/sync/status`);
    return response.data;
};

/**
 * 触发同步
 */
export const triggerSync = async (leagueId) => {
    const response = await axios.post(`${API_BASE_URL}/sync/trigger?league_id=${leagueId}`);
    return response.data;
};
