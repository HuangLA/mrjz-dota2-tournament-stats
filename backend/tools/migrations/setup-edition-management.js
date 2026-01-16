require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function setupEditionManagement() {
    console.log('🚀 Setting up Edition Management System...\n');

    try {
        // 1. 创建 editions 表
        console.log('📊 Creating editions table...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS editions (
                edition_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '赛季ID',
                edition_number INT NOT NULL UNIQUE COMMENT '届数（1,2,3...）',
                edition_name VARCHAR(100) NOT NULL COMMENT '赛季名称',
                start_date DATE NOT NULL COMMENT '开始日期',
                end_date DATE COMMENT '结束日期（NULL表示当前赛季）',
                description TEXT COMMENT '赛季描述',
                is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_dates (start_date, end_date),
                INDEX idx_edition_number (edition_number)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='赛季配置表'
        `);
        console.log('✅ Editions table created\n');

        // 2. 插入初始赛季数据
        console.log('📝 Inserting initial edition data...');
        await sequelize.query(`
            INSERT INTO editions (edition_number, edition_name, start_date, end_date, description)
            VALUES 
                (1, '第一届 MRJZ 赛事', '2025-01-01', '2025-12-31', '首届赛事，2026年1月1日之前的所有比赛'),
                (2, '第二届 MRJZ 赛事', '2026-01-01', '2026-02-15', '第二届赛事，2026年1月1日至2月15日')
            ON DUPLICATE KEY UPDATE 
                edition_name = VALUES(edition_name),
                start_date = VALUES(start_date),
                end_date = VALUES(end_date),
                description = VALUES(description)
        `);
        console.log('✅ Initial edition data inserted\n');

        // 3. 查看当前比赛的日期分布
        console.log('📅 Analyzing match date distribution...');
        const [dateStats] = await sequelize.query(`
            SELECT 
                DATE(start_time) as match_date,
                COUNT(*) as match_count
            FROM matches
            GROUP BY DATE(start_time)
            ORDER BY match_date
        `);

        console.log('Match dates:');
        dateStats.forEach(stat => {
            console.log(`  ${stat.match_date}: ${stat.match_count} matches`);
        });
        console.log('');

        // 4. 根据日期规则更新 edition
        console.log('🔄 Updating match editions based on date rules...');

        // 第一届：< 2026-01-01
        const [result1] = await sequelize.query(`
            UPDATE matches 
            SET edition = 1 
            WHERE start_time < '2026-01-01 00:00:00'
        `);
        console.log(`✅ Edition 1: Updated ${result1.affectedRows || 0} matches (before 2026-01-01)`);

        // 第二届：2026-01-01 ~ 2026-02-15
        const [result2] = await sequelize.query(`
            UPDATE matches 
            SET edition = 2 
            WHERE start_time >= '2026-01-01 00:00:00' 
              AND start_time <= '2026-02-15 23:59:59'
        `);
        console.log(`✅ Edition 2: Updated ${result2.affectedRows || 0} matches (2026-01-01 to 2026-02-15)`);

        // 5. 验证结果
        console.log('\n📊 Edition distribution:');
        const [editionStats] = await sequelize.query(`
            SELECT 
                m.edition,
                e.edition_name,
                COUNT(*) as match_count,
                MIN(DATE(m.start_time)) as first_match,
                MAX(DATE(m.start_time)) as last_match
            FROM matches m
            LEFT JOIN editions e ON m.edition = e.edition_number
            GROUP BY m.edition, e.edition_name
            ORDER BY m.edition
        `);

        editionStats.forEach(stat => {
            console.log(`  ${stat.edition_name || `Edition ${stat.edition}`}:`);
            console.log(`    Matches: ${stat.match_count}`);
            console.log(`    Date range: ${stat.first_match} to ${stat.last_match}`);
        });

        // 6. 统计每届的战队数量
        console.log('\n🏆 Teams per edition:');
        const [teamStats] = await sequelize.query(`
            SELECT 
                m.edition,
                COUNT(DISTINCT m.radiant_team_id) + COUNT(DISTINCT m.dire_team_id) as unique_teams
            FROM matches m
            WHERE m.radiant_team_id IS NOT NULL OR m.dire_team_id IS NOT NULL
            GROUP BY m.edition
            ORDER BY m.edition
        `);

        teamStats.forEach(stat => {
            console.log(`  Edition ${stat.edition}: ${stat.unique_teams} teams`);
        });

        console.log('\n🎉 Edition management system setup completed!');
        console.log('\n💡 Next steps:');
        console.log('  - Use GET /api/editions to list all editions');
        console.log('  - Use ?edition=1 or ?edition=2 to filter data');
        console.log('  - Admin APIs are ready for future implementation');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }

    process.exit(0);
}

setupEditionManagement();
