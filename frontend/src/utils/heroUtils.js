import { HERO_ID_TO_NAME } from './heroMapping';

/**
 * 获取英雄头像 URL
 * @param {number} heroId - 英雄ID
 * @returns {string} 英雄头像URL
 */
export const getHeroAvatarUrl = (heroId) => {
    const heroName = HERO_ID_TO_NAME[heroId];
    if (!heroName) {
        // Fallback to antimage if really unknown, as per original logic.
        // User requested NOT to use Stratz.
        return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
    }
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png`;
};

// 别名导出，保持兼容性
export const getHeroIconUrl = getHeroAvatarUrl;

/**
 * 从比赛数据中提取队伍阵容
 * @param {Array} players - 选手数据
 * @param {string} team - 队伍 ('radiant' 或 'dire')
 */
export const getTeamLineup = (players, team) => {
    if (!players) return [];
    return players
        .filter(p => p.team === team)
        .map(p => p.hero_id);
};
