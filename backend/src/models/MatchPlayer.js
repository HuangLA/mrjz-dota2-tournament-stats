const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MatchPlayer = sequelize.define('MatchPlayer', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        comment: '主键ID'
    },
    match_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '比赛ID'
    },
    player_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '选手ID'
    },
    hero_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '英雄ID'
    },
    team: {
        type: DataTypes.ENUM('radiant', 'dire'),
        allowNull: false,
        comment: '队伍'
    },
    kills: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '击杀'
    },
    deaths: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '死亡'
    },
    assists: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '助攻'
    },
    gpm: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '每分钟金钱'
    },
    xpm: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '每分钟经验'
    },
    items: {
        type: DataTypes.JSON,
        comment: '物品列表'
    },
    ability_upgrades: {
        type: DataTypes.JSON,
        comment: '技能加点'
    },
    hero_damage: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '英雄伤害'
    },
    tower_damage: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '建筑伤害'
    },
    hero_healing: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '英雄治疗'
    },
    // 背包装备
    item_backpack_0: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '背包装备1'
    },
    item_backpack_1: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '背包装备2'
    },
    item_backpack_2: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '背包装备3'
    },
    // 中立装备
    item_neutral: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '中立装备'
    },
    // 路线信息
    lane: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: '路线'
    },
    // 经济数据
    net_worth: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '净值'
    },
    last_hits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '正补'
    },
    denies: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '反补'
    }
}, {
    tableName: 'match_players',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['match_id'] },
        { fields: ['player_id'] },
        { fields: ['hero_id'] }
    ]
});

module.exports = MatchPlayer;
