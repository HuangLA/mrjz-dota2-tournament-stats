const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Player = sequelize.define('Player', {
    player_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        comment: '选手ID'
    },
    steam_id: {
        type: DataTypes.BIGINT,
        unique: true,
        allowNull: false,
        comment: 'Steam ID (64位)'
    },
    nickname: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '昵称'
    },
    avatar_url: {
        type: DataTypes.STRING(255),
        comment: '头像URL'
    },
    total_matches: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '总场次'
    },
    total_wins: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '胜场'
    },
    avg_kda: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        comment: '平均KDA'
    }
}, {
    tableName: 'players',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['steam_id'] }
    ]
});

module.exports = Player;
