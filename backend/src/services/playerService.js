const axios = require('axios');

/**
 * 将 Dota 2 Account ID 转换为 Steam ID 64位
 * @param {number} accountId - Dota 2 Account ID
 * @returns {string} Steam ID 64位
 */
function accountIdToSteamId64(accountId) {
    const STEAM_ID_BASE = BigInt('76561197960265728');
    return (STEAM_ID_BASE + BigInt(accountId)).toString();
}

/**
 * 从 Steam API 获取玩家信息
 * @param {Array} steamIds - Steam ID 64位数组（最多100个）
 * @param {string} apiKey - Steam API Key
 * @returns {Promise<Array>} 玩家信息数组
 */
async function getPlayerSummaries(steamIds, apiKey) {
    try {
        const url = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/';
        const response = await axios.get(url, {
            params: {
                key: apiKey,
                steamids: steamIds.join(',')
            },
            timeout: 10000
        });

        return response.data.response?.players || [];
    } catch (error) {
        console.error('Failed to fetch player summaries:', error.message);
        return [];
    }
}

/**
 * 同步玩家昵称到数据库
 * @param {Array} playerIds - players 表的 player_id 数组（外键ID）
 * @param {Object} sequelize - Sequelize 实例
 * @param {string} apiKey - Steam API Key
 */
async function syncPlayerNicknames(playerIds, sequelize, apiKey) {
    if (!playerIds || playerIds.length === 0) {
        return;
    }

    try {
        // 1. 从 players 表获取 steam_id（真正的 Account ID）
        const [players] = await sequelize.query(`
            SELECT player_id, steam_id
            FROM players
            WHERE player_id IN (${playerIds.join(',')})
        `);

        if (players.length === 0) {
            return;
        }

        // 2. 转换为 Steam ID 64位
        const steamIdMap = new Map(); // steam_id_64 -> player_id
        const steamIds64 = players.map(p => {
            const steamId64 = accountIdToSteamId64(p.steam_id);
            steamIdMap.set(steamId64, p.player_id);
            return steamId64;
        });

        // 3. 批量获取玩家信息（Steam API 一次最多100个）
        const batchSize = 100;
        for (let i = 0; i < steamIds64.length; i += batchSize) {
            const batch = steamIds64.slice(i, i + batchSize);
            const playerSummaries = await getPlayerSummaries(batch, apiKey);

            // 4. 更新数据库 - 使用 player_id 作为条件
            for (const summary of playerSummaries) {
                const playerId = steamIdMap.get(summary.steamid);
                if (playerId) {
                    await sequelize.query(`
                        UPDATE players
                        SET nickname = ?, avatar_url = ?
                        WHERE player_id = ?
                    `, {
                        replacements: [summary.personaname, summary.avatarfull, playerId]
                    });
                    console.log(`✅ Updated player ${playerId}: ${summary.personaname}`);
                }
            }
        }
    } catch (error) {
        console.error('Error syncing player nicknames:', error.message);
    }
}

module.exports = {
    accountIdToSteamId64,
    getPlayerSummaries,
    syncPlayerNicknames
};
