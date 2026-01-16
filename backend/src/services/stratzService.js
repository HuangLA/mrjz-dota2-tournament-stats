const axios = require('axios');
const stratzConfig = require('../config/stratz');

class StratzService {
    constructor() {
        this.apiUrl = stratzConfig.STRATZ_API_URL;
        this.apiToken = stratzConfig.STRATZ_API_TOKEN;
    }

    /**
     * 调用 Stratz GraphQL API
     * @param {string} query - GraphQL 查询
     * @returns {Promise<Object>} API 响应数据
     */
    async makeRequest(query) {
        try {
            const response = await axios.post(this.apiUrl, {
                query: query
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: stratzConfig.REQUEST_TIMEOUT
            });

            if (response.data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
            }

            return response.data.data;
        } catch (error) {
            console.error('Stratz API request failed:', error.message);
            throw error;
        }
    }

    /**
     * 获取比赛的详细数据（用于高级成就检测）
     * @param {number} matchId - 比赛ID
     * @returns {Promise<Object>} 比赛详细数据
     */
    async getMatchDetails(matchId) {
        try {
            const query = stratzConfig.MATCH_DETAILS_QUERY(matchId);
            const data = await this.makeRequest(query);

            if (!data || !data.match) {
                console.warn(`No Stratz data for match ${matchId}`);
                return null;
            }

            return this.transformMatchData(data.match);
        } catch (error) {
            console.error(`Failed to get Stratz data for match ${matchId}:`, error.message);
            return null;
        }
    }

    /**
     * 转换 Stratz 数据格式
     */
    transformMatchData(stratzMatch) {
        return {
            match_id: stratzMatch.id,
            radiant_win: stratzMatch.didRadiantWin,
            players: stratzMatch.players.map(p => ({
                account_id: p.steamAccountId,
                is_victory: p.isVictory,
                kills: p.kills,
                deaths: p.deaths,
                assists: p.assists,
                rampages: p.stats?.rampages || 0,
                godlike: p.stats?.godLike || 0,
                first_blood_time: p.stats?.firstBloodTime || null,
                kill_streaks: p.stats?.killStreaks || []
            })),
            roshan_events: stratzMatch.playbackData?.roshanEvents || []
        };
    }

    /**
     * 检测高级成就（需要 Stratz 数据）
     * @param {Object} stratzData - Stratz 比赛数据
     * @returns {Array} 检测到的成就列表
     */
    detectAdvancedAchievements(stratzData) {
        const achievements = [];

        for (const player of stratzData.players) {
            // 暴虐成狂 (Rampage)
            if (player.rampages > 0) {
                achievements.push({
                    type: 'rampage',
                    name: '暴虐成狂',
                    account_id: player.account_id,
                    value: { rampages: player.rampages }
                });
            }

            // 位列仙班 (Godlike)
            if (player.godlike > 0) {
                achievements.push({
                    type: 'godlike',
                    name: '位列仙班',
                    account_id: player.account_id,
                    value: { godlike: player.godlike }
                });
            }

            // 旗开得胜 (First Blood)
            if (player.first_blood_time !== null && player.first_blood_time > 0) {
                achievements.push({
                    type: 'first_blood',
                    name: '旗开得胜',
                    account_id: player.account_id,
                    value: { time: player.first_blood_time }
                });
            }
        }

        // 虎口夺食 & 让让你们的呀 (Roshan/Aegis 相关)
        if (stratzData.roshan_events && stratzData.roshan_events.length > 0) {
            // 分析 Roshan 事件
            const winningTeam = stratzData.radiant_win ? 'radiant' : 'dire';

            stratzData.roshan_events.forEach(event => {
                const eventTeam = event.isRadiant ? 'radiant' : 'dire';

                // 让让你们的呀：获胜队伍拿到盾
                if (eventTeam === winningTeam && event.didRadiantPickup !== null) {
                    achievements.push({
                        type: 'aegis_victory',
                        name: '让让你们的呀',
                        account_id: null,
                        team: winningTeam,
                        value: { time: event.time }
                    });
                }
            });
        }

        return achievements;
    }
}

module.exports = new StratzService();
