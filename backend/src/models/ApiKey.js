const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApiKey = sequelize.define('ApiKey', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '主键ID'
    },
    key_value: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        comment: 'API Key值'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: '是否启用'
    },
    usage_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '使用次数'
    },
    last_used_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '最后使用时间'
    }
}, {
    tableName: 'api_keys',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['is_active'] }
    ]
});

module.exports = ApiKey;
