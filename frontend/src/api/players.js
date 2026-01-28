import apiClient from './axios';

export const getPlayers = async (params) => {
    try {
        // apiClient already handles response.data in interceptor
        const data = await apiClient.get('/players', { params });
        return data;
    } catch (error) {
        console.error('Error fetching players:', error);
        throw error;
    }
};

export const getPlayerById = async (id) => {
    try {
        const data = await apiClient.get(`/players/${id}`);
        return data;
    } catch (error) {
        console.error(`Error fetching player ${id}:`, error);
        throw error;
    }
};

export const getPlayerMatches = async (id, params) => {
    try {
        const data = await apiClient.get(`/players/${id}/matches`, { params });
        return data;
    } catch (error) {
        console.error(`Error fetching matches for player ${id}:`, error);
        throw error;
    }
};

export const getPlayerStats = async (id) => {
    try {
        const data = await apiClient.get(`/players/${id}/stats`);
        return data;
    } catch (error) {
        console.error(`Error fetching stats for player ${id}:`, error);
        throw error;
    }
};

export const getPlayerAchievements = async (id) => {
    try {
        const data = await apiClient.get(`/players/${id}/achievements`);
        return data;
    } catch (error) {
        console.error(`Error fetching achievements for player ${id}:`, error);
        throw error;
    }
};
