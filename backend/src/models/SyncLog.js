const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SyncLog = sequelize.define('SyncLog', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        comment: '主键ID'
    },
    sync_type: {
        type: DataTypes.ENUM('match', 'player', 'hero'),
        allowNull: false,
        comment: '同步类型'
    },
    status: {
        type: DataTypes.ENUM('success', 'failed'),
        allowNull: false,
        comment: '同步状态'
    },
    error_message: {
        type: DataTypes.TEXT,
        comment: '错误信息'
    },
    synced_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '同步数量'
    }
}, {
    tableName: 'sync_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['sync_type'] },
        { fields: ['status'] },
        { fields: ['created_at'] }
    ]
});

module.exports = SyncLog;
