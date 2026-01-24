/**
 * 将 Dota 2 account_id (32位) 转换为 Steam ID 64位
 * @param {number} accountId - 32位 account_id
 * @returns {string} 64位 Steam ID
 */
function accountIdToSteamId64(accountId) {
    // Steam ID 64位格式: 76561197960265728 + account_id
    const STEAM_ID_BASE = BigInt('76561197960265728');
    return (STEAM_ID_BASE + BigInt(accountId)).toString();
}

/**
 * 将 Steam ID 64位转换为 Dota 2 account_id (32位)
 * @param {string} steamId64 - 64位 Steam ID
 * @returns {number} 32位 account_id
 */
function steamId64ToAccountId(steamId64) {
    const STEAM_ID_BASE = BigInt('76561197960265728');
    return Number(BigInt(steamId64) - STEAM_ID_BASE);
}

module.exports = {
    accountIdToSteamId64,
    steamId64ToAccountId
};
