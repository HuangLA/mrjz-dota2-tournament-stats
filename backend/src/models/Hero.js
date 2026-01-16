const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Hero = sequelize.define('Hero', {
    hero_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        comment: '英雄ID'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '英雄英文名'
    },
    localized_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '英雄中文名'
    },
    icon_url: {
        type: DataTypes.STRING(255),
        comment: '头像URL'
    },
    attribute: {
        type: DataTypes.ENUM('strength', 'agility', 'intelligence'),
        comment: '主属性'
    }
}, {
    tableName: 'heroes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Hero;
