require('dotenv').config();

module.exports = {
    // Steam API Base URL (使用 HTTP，参考旧项目实现)
    STEAM_API_BASE_URL: 'http://api.steampowered.com',

    // DOTA2 API 接口
    DOTA2_MATCH_HISTORY: '/IDOTA2Match_570/GetMatchHistory/v1',
    DOTA2_MATCH_DETAILS: '/IDOTA2Match_570/GetMatchDetails/v1',
    DOTA2_HEROES: '/IEconDOTA2_570/GetHeroes/v1',
    STEAM_PLAYER_SUMMARIES: '/ISteamUser/GetPlayerSummaries/v0002',

    // 从环境变量或数据库获取 API Key
    getSteamApiKey: async () => {
        // 优先使用环境变量
        if (process.env.STEAM_API_KEY) {
            return process.env.STEAM_API_KEY;
        }

        // 从数据库获取活跃的 API Key
        try {
            const { ApiKey } = require('../models');
            const apiKey = await ApiKey.findOne({
                where: { is_active: true },
                order: [['usage_count', 'ASC']] // 使用次数最少的优先
            });

            if (apiKey) {
                // 更新使用次数
                await apiKey.update({
                    usage_count: apiKey.usage_count + 1,
                    last_used_at: new Date()
                });
                return apiKey.key_value;
            }
        } catch (error) {
            console.error('Failed to get API key from database:', error.message);
        }

        throw new Error('No Steam API key available');
    },

    // 请求配置
    REQUEST_TIMEOUT: 30000, // 30秒超时
    MAX_RETRIES: 3 // 最大重试次数
};
