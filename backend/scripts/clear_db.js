const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

// Configuration
const DB_NAME = process.env.DB_NAME || 'mrjz';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
    timezone: '+08:00'
});

async function clearData() {
    try {
        console.log('🗑️  Clearing database data (Matches)...');
        await sequelize.authenticate();

        // Delete all matches. Cascading should handle match_players and achievements.
        // We will keep Players and Heroes as they are independent/static-ish.
        await sequelize.query('DELETE FROM matches');
        // Reset auto increment is nice but not strictly required for IDs that are bigints from Steam. 
        // But matches uses match_id provided by Steam, so auto_increment isn't the main key usually (it is in SQL definition: match_id BIGINT PRIMARY KEY). 
        // match_id is not auto_increment.

        console.log('✅ All matches cleared.');

        // Also clear sync_logs to have a clean slate? Maybe not. User just said "clear data".
        // Usually implies match data.

    } catch (error) {
        console.error('❌ Failed to clear data:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

clearData();
