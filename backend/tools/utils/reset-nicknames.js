require('dotenv').config();
const { sequelize } = require('../../src/config/database');

async function resetNicknames() {
    console.log('🔄 Resetting all player nicknames...\n');

    try {
        // 重置所有 nickname 为 Player_{steam_id} 格式
        const [result] = await sequelize.query(`
            UPDATE players
            SET nickname = CONCAT('Player_', steam_id),
                avatar_url = NULL
        `);

        console.log(`✅ Reset ${result.affectedRows} player nicknames to default format`);
        console.log('✅ Cleared all avatar URLs\n');

        // 显示一些示例
        const [samples] = await sequelize.query(`
            SELECT player_id, steam_id, nickname
            FROM players
            LIMIT 5
        `);

        console.log('Sample data after reset:');
        samples.forEach(p => {
            console.log(`  Player ID: ${p.player_id}, Steam ID: ${p.steam_id}, Nickname: ${p.nickname}`);
        });

        console.log('\n✅ All nicknames have been reset!');
        console.log('💡 Nicknames will be automatically synced when you visit match detail pages.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    process.exit(0);
}

resetNicknames();
