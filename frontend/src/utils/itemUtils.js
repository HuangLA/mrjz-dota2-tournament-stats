import { ITEM_ID_TO_NAME } from './itemMapping';

/**
 * 获取物品图片 URL
 * @param {number} itemId - 物品ID
 * @returns {string} 物品图片URL
 */
export const getItemImageUrl = (itemId) => {
    const itemName = ITEM_ID_TO_NAME[itemId];
    if (!itemName) {
        return null; // 返回 null 表示无效物品
    }
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${itemName}.png`;
};

/**
 * 获取物品名称
 * @param {number} itemId - 物品ID
 * @returns {string} 物品名称
 */
export const getItemName = (itemId) => {
    return ITEM_ID_TO_NAME[itemId] || 'unknown';
};
