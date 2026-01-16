import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 配置 dayjs 插件
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 格式化时间
 * @param {string|number} time - ISO 时间字符串或 Unix 时间戳（秒）
 * @param {string} format - 格式化模板
 */
export const formatTime = (time, format = 'YYYY-MM-DD HH:mm') => {
    // 如果是数字，说明是 Unix 时间戳（秒），需要转换为毫秒
    if (typeof time === 'number') {
        return dayjs.unix(time).tz('Asia/Shanghai').format(format);
    }
    // 如果是字符串，直接解析
    return dayjs(time).tz('Asia/Shanghai').format(format);
};

/**
 * 格式化时长（秒转换为 分:秒）
 * @param {number} seconds - 秒数
 */
export const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 格式化 KDA
 * @param {number} kills
 * @param {number} deaths
 * @param {number} assists
 */
export const formatKDA = (kills, deaths, assists) => {
    return `${kills}/${deaths}/${assists}`;
};

/**
 * 计算 KDA 比率
 * @param {number} kills
 * @param {number} deaths
 * @param {number} assists
 */
export const calculateKDA = (kills, deaths, assists) => {
    if (deaths === 0) {
        return (kills + assists).toFixed(2);
    }
    return ((kills + assists) / deaths).toFixed(2);
};
