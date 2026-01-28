import axios from 'axios';

// API 基础配置
// API 基础配置
// 如果没有设置 VITE_API_URL，则自动使用当前 host
const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // 假设后端运行在同一主机的 3001 端口
    return `http://${window.location.hostname}:3001/api`;
};

const API_BASE_URL = getBaseUrl();

// 创建 axios 实例
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default apiClient;
