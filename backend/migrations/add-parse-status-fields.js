const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.addColumn('matches', 'parse_requested', {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            comment: '是否已请求OpenDota解析'
        });

        await queryInterface.addColumn('matches', 'is_parsed', {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            comment: '是否已完全解析（有objectives数据）'
        });

        await queryInterface.addColumn('matches', 'parse_requested_at', {
            type: DataTypes.DATE,
            allowNull: true,
            comment: '请求解析的时间'
        });

        console.log('✅ 已添加解析状态字段到 matches 表');
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('matches', 'parse_requested');
        await queryInterface.removeColumn('matches', 'is_parsed');
        await queryInterface.removeColumn('matches', 'parse_requested_at');

        console.log('✅ 已移除解析状态字段');
    }
};
