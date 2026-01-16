// 物品和技能图标工具函数

// Steam Community CDN 基础 URL
const STEAM_CDN_BASE = 'https://steamcdn-a.akamaihd.net/apps/dota2/images/dota_react';

/**
 * 获取物品图标 URL (使用在线 CDN)
 * @param {string} itemName - 物品名称 (例如: "blink", "black_king_bar")
 * @returns {string} 物品图标URL
 */
export const getItemIconUrl = (itemName) => {
    if (!itemName || itemName === 'empty' || itemName === 0) {
        return null;
    }
    // 移除 "item_" 前缀（如果有）
    const name = itemName.replace('item_', '');
    return `${STEAM_CDN_BASE}/items/${name}.png`;
};

/**
 * 获取技能图标 URL (使用在线 CDN)
 * @param {string} abilityName - 技能名称
 * @returns {string} 技能图标URL
 */
export const getAbilityIconUrl = (abilityName) => {
    if (!abilityName) {
        return null;
    }
    return `${STEAM_CDN_BASE}/abilities/${abilityName}.png`;
};

/**
 * 从物品ID数组中过滤掉空物品
 * @param {Array} items - 物品ID数组 [item_0, item_1, ...]
 * @returns {Array} 过滤后的物品数组
 */
export const filterEmptyItems = (items) => {
    if (!items) return [];
    return items.filter(item => item && item !== 0 && item !== 'empty');
};

/**
 * 获取占位符图片 URL
 * @returns {string} 占位符URL
 */
export const getPlaceholderUrl = () => {
    return '/assets/placeholder.png';
};
