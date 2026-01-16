const axios = require('axios');
const steamConfig = require('../config/steam');

class SteamService {
    constructor() {
        this.baseURL = steamConfig.STEAM_API_BASE_URL;
        this.timeout = steamConfig.REQUEST_TIMEOUT;
        this.maxRetries = steamConfig.MAX_RETRIES;
    }

    /**
     * 发送 HTTP 请求（带重试机制）
     */
    async makeRequest(url, params, retries = 0) {
        try {
            const response = await axios.get(url, {
                params,
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            if (retries < this.maxRetries) {
                console.log(`Request failed, retrying... (${retries + 1}/${this.maxRetries})`);
                await this.sleep(1000 * (retries + 1)); // 递增延迟
                return this.makeRequest(url, params, retries + 1);
            }
            throw new Error(`Steam API request failed: ${error.message}`);
        }
    }

    /**
     * 延迟函数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取联赛比赛历史（包含战队 ID）
     * @param {number} leagueId - 联赛ID
     * @returns {Promise<Array>} 比赛列表（包含 match_id, radiant_team_id, dire_team_id）
     */
    async getMatchHistory(leagueId) {
        try {
            const apiKey = await steamConfig.getSteamApiKey();
            const url = `${this.baseURL}${steamConfig.DOTA2_MATCH_HISTORY}`;
            const params = {
                league_id: leagueId,
                key: apiKey,
                matches_requested: 100  // 每次最多获取 100 场
            };

            const data = await this.makeRequest(url, params);

            if (data.result && data.result.matches) {
                // 返回完整的比赛信息，包含战队 ID
                return data.result.matches.map(match => ({
                    match_id: match.match_id,
                    radiant_team_id: match.radiant_team_id || null,
                    dire_team_id: match.dire_team_id || null
                }));
            }

            return [];
        } catch (error) {
            console.error('getMatchHistory error:', error.message);
            throw error;
        }
    }

    /**
   * 获取比赛详情（使用 OpenDota API）
   * Steam API GetMatchDetails 当前有问题，改用 OpenDota API
   * @param {number} matchId - 比赛ID
   * @returns {Promise<Object>} 比赛详情数据
   */
    async getMatchDetails(matchId) {
        try {
            // 使用 OpenDota API（免费，无需 API Key）
            const url = `https://api.opendota.com/api/matches/${matchId}`;

            const data = await this.makeRequest(url, {});

            if (data && data.match_id) {
                // OpenDota 返回的数据结构与 Steam API 略有不同，需要适配
                return {
                    match_id: data.match_id,
                    duration: data.duration,
                    start_time: data.start_time,
                    radiant_win: data.radiant_win,
                    radiant_score: data.radiant_score,
                    dire_score: data.dire_score,
                    game_mode: data.game_mode,
                    league_id: data.leagueid,
                    players: data.players ? data.players.map(p => ({
                        account_id: p.account_id,
                        player_slot: p.player_slot,
                        hero_id: p.hero_id,
                        kills: p.kills,
                        deaths: p.deaths,
                        assists: p.assists,
                        gold_per_min: p.gold_per_min,
                        xp_per_min: p.xp_per_min,
                        item_0: p.item_0,
                        item_1: p.item_1,
                        item_2: p.item_2,
                        item_3: p.item_3,
                        item_4: p.item_4,
                        item_5: p.item_5,
                        backpack_0: p.backpack_0,
                        backpack_1: p.backpack_1,
                        backpack_2: p.backpack_2,
                        item_neutral: p.item_neutral,
                        last_hits: p.last_hits,
                        denies: p.denies,
                        net_worth: p.net_worth,
                        lane: p.lane,
                        ability_upgrades: p.ability_upgrades,
                        hero_damage: p.hero_damage,
                        tower_damage: p.tower_damage,
                        hero_healing: p.hero_healing,
                        multi_kills: p.multi_kills,
                        first_blood_claimed: p.firstblood_claimed,
                        rampage: p.multi_kills >= 5,
                        godlike: p.multi_kills >= 3
                    })) : []
                };
            }

            return null;
        } catch (error) {
            console.error(`getMatchDetails error for match ${matchId}:`, error.message);
            throw error;
        }
    }

    /**
     * 获取英雄列表
     * @returns {Promise<Array>} 英雄列表
     */
    async getHeroes() {
        try {
            const apiKey = await steamConfig.getSteamApiKey();
            const url = `${this.baseURL}${steamConfig.DOTA2_HEROES}`;
            const params = {
                key: apiKey,
                language: 'zh_cn'
            };

            const data = await this.makeRequest(url, params);

            if (data.result && data.result.heroes) {
                return data.result.heroes;
            }

            return [];
        } catch (error) {
            console.error('getHeroes error:', error.message);
            throw error;
        }
    }

    /**
     * 获取战队信息
     * @param {number} teamId - 战队ID
     * @returns {Promise<Object>} 战队信息 { team_id, team_name, team_tag }
     */
    async getTeamInfo(teamId) {
        try {
            const apiKey = await steamConfig.getSteamApiKey();
            const url = 'http://api.steampowered.com/IDOTA2Match_570/GetTeamInfoByTeamID/v1';
            const params = {
                key: apiKey,
                start_at_team_id: teamId,
                teams_requested: 1
            };

            const data = await this.makeRequest(url, params);

            const teams = data.result?.teams || [];
            if (teams.length > 0) {
                return {
                    team_id: teamId,
                    team_name: teams[0].name,
                    team_tag: teams[0].tag || ''
                };
            }
            return null;
        } catch (error) {
            console.error(`getTeamInfo error for team ${teamId}:`, error.message);
            return null;
        }
    }

    /**
     * 获取玩家信息
     * @param {string} steamId - Steam ID (64位)
     * @returns {Promise<Object>} 玩家信息
     */
    async getPlayerSummaries(steamId) {
        try {
            const apiKey = await steamConfig.getSteamApiKey();
            const url = `${this.baseURL}${steamConfig.STEAM_PLAYER_SUMMARIES}`;
            const params = {
                steamids: steamId,
                key: apiKey
            };

            const data = await this.makeRequest(url, params);

            if (data.response && data.response.players && data.response.players.length > 0) {
                return data.response.players[0];
            }

            return null;
        } catch (error) {
            console.error(`getPlayerSummaries error for ${steamId}:`, error.message);
            throw error;
        }
    }
}

module.exports = new SteamService();
