// 成就类型映射
export const ACHIEVEMENT_TYPES = {
    rampage: {
        name: '暴虐成狂',
        desc: '完成暴走',
        color: '#ff4d4f'
    },
    first_blood: {
        name: '旗开得胜',
        desc: '首杀',
        color: '#fa541c'
    },
    aegis_snatch: {
        name: '虎口夺食',
        desc: '夺取不朽之守护',
        color: '#faad14'
    },
    triple_double: {
        name: '你也是威少粉丝',
        desc: '完成三双',
        color: '#52c41a'
    },
    godlike: {
        name: '位列仙班',
        desc: '完成超神杀戮',
        color: '#13c2c2'
    },
    carry_game: {
        name: '对不起这把比赛我要赢',
        desc: '获胜且击杀超过全队1/2',
        color: '#1890ff'
    },
    perfect_game: {
        name: '完美演出',
        desc: '获胜且0死亡',
        color: '#722ed1'
    },
    aegis_victory: {
        name: '让让你们的呀',
        desc: '摧毁不朽之守护且获胜',
        color: '#eb2f96'
    }
};

// 队伍类型
export const TEAMS = {
    radiant: '天辉',
    dire: '夜魇'
};

// 游戏模式映射 (基于 OpenDota API 实际返回值)
// 注意：OpenDota 的映射与 Valve 官方文档略有不同
export const GAME_MODES = {
    0: '未知',               // Unknown
    1: '全选模式',           // All Pick
    2: '队长模式',           // Captain's Mode
    3: '随机征召',           // Random Draft
    4: '单一征召',           // Single Draft ✓ (OpenDota confirmed)
    5: '全随机',             // All Random
    6: '简介',               // Intro
    7: '冥灵夜行',           // Diretide (Event)
    8: '反队长模式',         // Reverse Captain's Mode
    9: '贪魔节',             // The Greeviling (Event)
    10: '教程',              // Tutorial
    11: '单中模式',          // Mid Only
    12: '最少游玩',          // Least Played
    13: '新手联赛',          // Limited Heroes
    14: '组队天梯',          // Compendium Matchmaking
    15: '自定义',            // Custom
    16: '队长征召',          // Captain's Draft
    17: '平衡征召',          // Balanced Draft
    18: '技能征召',          // Ability Draft
    19: '活动',              // Event
    20: '全随机死亡竞赛',    // All Random Deathmatch
    21: '单中1v1',           // 1v1 Mid
    22: '天梯全选',          // Ranked All Pick
    23: '加速模式',          // Turbo
    24: '突变模式',          // Mutation
};
