const { Sequelize } = require('sequelize');
require('dotenv').config();

// 创建 Sequelize 实例
const sequelize = new Sequelize(
    process.env.DB_NAME || 'mrjz',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        timezone: '+08:00',
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true
        }
    }
);

// 测试数据库连接
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        return false;
    }
}

// 同步数据库（开发环境）
async function syncDatabase(force = false) {
    try {
        await sequelize.sync({ force });
        console.log('✅ Database synchronized successfully.');
    } catch (error) {
        console.error('❌ Database sync failed:', error.message);
        throw error;
    }
}

module.exports = {
    sequelize,
    testConnection,
    syncDatabase
};
