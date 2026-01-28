const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load from backend/.env consistently
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
// const path = require('path'); // Removed duplicate

// Configuration
const DB_NAME = process.env.DB_NAME || 'mrjz';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

console.log(`User: ${DB_USER}`);
console.log(`Database: ${DB_NAME}`);

// Initialize Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false, // Suppress logs
    timezone: '+08:00'
});

async function upgrade() {
    try {
        console.log('🚀 Starting Database Upgrade...');

        // 1. Check connection
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        const queryInterface = sequelize.getQueryInterface();
        const tableName = 'match_players';
        const columnName = 'damage_taken';

        // 2. Check if column exists
        const tableDesc = await queryInterface.describeTable(tableName);

        if (tableDesc[columnName]) {
            console.log(`ℹ️  Column '${columnName}' already exists in '${tableName}'. Skipping.`);
        } else {
            console.log(`🛠️  Adding column '${columnName}' to '${tableName}'...`);
            await queryInterface.addColumn(tableName, columnName, {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                comment: '承受伤害',
                after: 'hero_healing' // Order it nicely
            });
            console.log(`✅ Column '${columnName}' added successfully.`);
        }

        console.log('✅ Upgrade completed!');
    } catch (error) {
        console.error('❌ Upgrade failed:', error.message);
        if (error.original && error.original.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('🔒 Access Denied. Please check your ../.env file credentials.');
        }
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

upgrade();
