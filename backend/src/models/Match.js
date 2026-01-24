const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Match = sequelize.define('Match', {
    match_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        comment: '比赛ID'
    },
    league_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '联赛ID'
    },
    start_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '开始时间(Unix时间戳)'
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '比赛时长(秒)'
    },
    radiant_win: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: '天辉是否获胜'
    },
    radiant_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '天辉击杀数'
    },
    dire_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '夜魇击杀数'
    },
    radiant_team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '天辉队伍ID'
    },
    radiant_team_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '天辉队伍名称'
    },
    dire_team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '夜魇队伍ID'
    },
    dire_team_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '夜魇队伍名称'
    },
    game_mode: {
        type: DataTypes.INTEGER,
        comment: '游戏模式'
    },
    parse_requested: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: '是否已请求OpenDota解析'
    },
    is_parsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: '是否已完全解析（有objectives数据）'
    },
    parse_requested_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '请求解析的时间'
    }
}, {
    tableName: 'matches',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['league_id'] },
        { fields: ['start_time'] }
    ]
});

module.exports = Match;
