require('dotenv').config();
const axios = require('axios');
const { sequelize } = require('../../src/config/database');

const STEAM_API_KEY = process.env.STEAM_API_KEY;

/**
 * 将 Dota 2 Account ID 转换为 Steam ID 64位
 * @param {number} accountId - Dota 2 Account ID
 * @returns {string} Steam ID 64位
 */
function accountIdToSteamId64(accountId) {
    // Steam ID 64 = 76561197960265728 + Account ID
    const STEAM_ID_BASE = BigInt('76561197960265728');
    return (STEAM_ID_BASE + BigInt(accountId)).toString();
}

/**
 * 从 Steam API 获取玩家信息
 * @param {Array} steamIds - Steam ID 64位数组
 * @returns {Promise<Array>} 玩家信息数组
 */
async function getPlayerSummaries(steamIds) {
    try {
        const url = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/';
        const response = await axios.get(url, {
            params: {
                key: STEAM_API_KEY,
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
 * 同步玩家昵称
 */
async function syncPlayerNicknames() {
    console.log('🚀 Starting player nickname synchronization...\n');

    try {
        // 1. 从 players 表获取所有玩家（包含 player_id 和 steam_id）
        const [players] = await sequelize.query(`
            SELECT player_id, steam_id, nickname
            FROM players
            ORDER BY player_id
        `);

        console.log(`Found ${players.length} players in database\n`);

        // 2. 创建映射：Steam ID 64 -> player_id
        const steamIdMap = new Map();
        const steamIds64 = players.map(p => {
            const steamId64 = accountIdToSteamId64(p.steam_id);
            steamIdMap.set(steamId64, p.player_id);
            return steamId64;
        });

        console.log(`Converted ${steamIds64.length} Account IDs to Steam ID 64-bit\n`);

        // 3. 批量处理（Steam API 一次最多100个）
        const batchSize = 100;
        let updated = 0;

        for (let i = 0; i < steamIds64.length; i += batchSize) {
            const batch = steamIds64.slice(i, i + batchSize);

            console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(steamIds64.length / batchSize)}...`);

            // 获取玩家信息
            const playerSummaries = await getPlayerSummaries(batch);

            // 更新数据库
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

                    console.log(`  ✅ ${summary.personaname} (player_id: ${playerId})`);
                    updated++;
                } else {
                    console.log(`  ⚠️  No player_id found for Steam ID ${summary.steamid}`);
                }
            }

            // 避免 API 限流
            if (i + batchSize < steamIds64.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`\n✅ Successfully updated ${updated}/${players.length} players`);
    } catch (error) {
        console.error('Error:', error);
    }

    process.exit(0);
}

syncPlayerNicknames();
