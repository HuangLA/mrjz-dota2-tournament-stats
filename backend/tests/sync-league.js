// 同步联赛 17485 的所有比赛
const syncService = require('./src/services/syncService');
const { Match, Player, MatchPlayer, Achievement } = require('./src/models');
const { testConnection } = require('./src/config/database');
require('dotenv').config();

async function syncAllLeagueMatches() {
    try {
        console.log('🚀 Syncing All Matches from League 17485\n');
        console.log('='.repeat(60));

        // 1. 测试数据库连接
        console.log('\n1️⃣ Testing database connection...');
        await testConnection();

        // 2. 显示同步前统计
        console.log('\n2️⃣ Before sync:');
        const before = {
            matches: await Match.count(),
            players: await Player.count(),
            matchPlayers: await MatchPlayer.count(),
            achievements: await Achievement.count()
        };
        console.log(`   Matches: ${before.matches}`);
        console.log(`   Players: ${before.players}`);
        console.log(`   Match Players: ${before.matchPlayers}`);
        console.log(`   Achievements: ${before.achievements}`);

        // 3. 执行完整同步
        console.log('\n3️⃣ Starting full league sync...');
        console.log('   League ID: 17485');
        console.log('   Strategy: Sequential with 2-3s delay between matches\n');

        const startTime = Date.now();
        const result = await syncService.syncMatches(17485);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`\n✅ Sync completed in ${duration}s`);
        console.log(`   Synced: ${result.synced} new matches`);
        console.log(`   Total: ${result.total} matches in league`);

        // 4. 显示同步后统计
        console.log('\n4️⃣ After sync:');
        const after = {
            matches: await Match.count(),
            players: await Player.count(),
            matchPlayers: await MatchPlayer.count(),
            achievements: await Achievement.count()
        };
        console.log(`   Matches: ${after.matches} (+${after.matches - before.matches})`);
        console.log(`   Players: ${after.players} (+${after.players - before.players})`);
        console.log(`   Match Players: ${after.matchPlayers} (+${after.matchPlayers - before.matchPlayers})`);
        console.log(`   Achievements: ${after.achievements} (+${after.achievements - before.achievements})`);

        // 5. 显示成就统计
        if (after.achievements > 0) {
            console.log('\n5️⃣ Achievement breakdown:');
            const achievements = await Achievement.findAll({
                attributes: [
                    'achievement_type',
                    'achievement_name',
                    [Achievement.sequelize.fn('COUNT', '*'), 'count']
                ],
                group: ['achievement_type', 'achievement_name']
            });

            achievements.forEach(a => {
                console.log(`   ${a.dataValues.achievement_name}: ${a.dataValues.count}`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ League sync completed successfully!\n');

    } catch (error) {
        console.error('\n❌ Sync failed:', error.message);
        console.error(error.stack);
    }
}

syncAllLeagueMatches();
