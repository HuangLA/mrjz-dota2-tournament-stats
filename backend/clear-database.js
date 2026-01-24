const { sequelize, Match, Player, MatchPlayer, Achievement, Hero, SyncLog } = require('./src/models');

async function clearDatabase() {
    try {
        console.log('🗑️  开始清空数据库...\n');

        // 禁用外键检查
        console.log('🔓 禁用外键检查...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('   ✅ 外键检查已禁用\n');

        // 清空所有表
        console.log('1️⃣ 删除成就数据...');
        await sequelize.query('TRUNCATE TABLE achievements');
        console.log('   ✅ 成就表已清空\n');

        console.log('2️⃣ 删除比赛选手数据...');
        await sequelize.query('TRUNCATE TABLE match_players');
        console.log('   ✅ 比赛选手表已清空\n');

        console.log('3️⃣ 删除比赛数据...');
        await sequelize.query('TRUNCATE TABLE matches');
        console.log('   ✅ 比赛表已清空\n');

        console.log('4️⃣ 删除选手数据...');
        await sequelize.query('TRUNCATE TABLE players');
        console.log('   ✅ 选手表已清空\n');

        console.log('5️⃣ 删除同步日志...');
        await sequelize.query('TRUNCATE TABLE sync_logs');
        console.log('   ✅ 同步日志表已清空\n');

        // 英雄数据通常保留
        console.log('ℹ️  英雄数据已保留（如需删除请取消注释）');
        // await sequelize.query('TRUNCATE TABLE heroes');

        // 重新启用外键检查
        console.log('\n🔒 重新启用外键检查...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('   ✅ 外键检查已启用\n');

        console.log('✅ 数据库清空完成！');
        console.log('📊 所有业务数据已删除，英雄数据已保留');

        await sequelize.close();
        console.log('\n🔌 数据库连接已关闭');

    } catch (error) {
        console.error('❌ 清空数据库失败:', error);
        // 确保重新启用外键检查
        try {
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        } catch (e) {
            // 忽略错误
        }
        process.exit(1);
    }
}

// 运行清空脚本
clearDatabase();
