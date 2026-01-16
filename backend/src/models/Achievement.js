const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Achievement = sequelize.define('Achievement', {
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
        allowNull: true,
        comment: '选手ID（队伍成就为NULL）'
    },
    achievement_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '成就类型'
    },
    achievement_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '成就名称'
    },
    achievement_desc: {
        type: DataTypes.STRING(255),
        comment: '成就描述'
    },
    team: {
        type: DataTypes.ENUM('radiant', 'dire'),
        allowNull: true,
        comment: '队伍（队伍成就用）'
    },
    value: {
        type: DataTypes.JSON,
        comment: '成就相关数据'
    }
}, {
    tableName: 'achievements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['match_id'] },
        { fields: ['player_id'] },
        { fields: ['achievement_type'] }
    ]
});

module.exports = Achievement;
