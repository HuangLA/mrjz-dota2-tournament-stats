import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const getPlayers = async (params) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/players`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching players:', error);
        throw error;
    }
};

export const getPlayerById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/players/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching player ${id}:`, error);
        throw error;
    }
};

export const getPlayerMatches = async (id, params) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/players/${id}/matches`, { params });
        return response.data;
    } catch (error) {
        console.error(`Error fetching matches for player ${id}:`, error);
        throw error;
    }
};

export const getPlayerStats = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/players/${id}/stats`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching stats for player ${id}:`, error);
        throw error;
    }
};

export const getPlayerAchievements = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/players/${id}/achievements`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching achievements for player ${id}:`, error);
        throw error;
    }
};
