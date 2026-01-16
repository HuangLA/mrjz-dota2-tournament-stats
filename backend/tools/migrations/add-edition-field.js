require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function addEditionField() {
    console.log('🔧 Adding edition field to matches table...\n');

    try {
        // 1. 检查字段是否已存在
        const [columns] = await sequelize.query(`
            SHOW COLUMNS FROM matches LIKE 'edition'
        `);

        if (columns.length === 0) {
            // 添加 edition 字段
            await sequelize.query(`
                ALTER TABLE matches 
                ADD COLUMN edition INT DEFAULT 1 COMMENT '赛事届数'
            `);
            console.log('✅ Added edition field to matches table');
        } else {
            console.log('ℹ️  Edition field already exists');
        }

        // 2. 获取当前所有战队
        const [teams] = await sequelize.query(`
            SELECT DISTINCT team_id, team_name
            FROM (
                SELECT radiant_team_id as team_id, radiant_team_name as team_name
                FROM matches
                WHERE radiant_team_id IS NOT NULL
                UNION
                SELECT dire_team_id as team_id, dire_team_name as team_name
                FROM matches
                WHERE dire_team_id IS NOT NULL
            ) t
            ORDER BY team_id
        `);

        console.log(`\n📊 Found ${teams.length} teams:`);
        teams.forEach((team, index) => {
            console.log(`  ${index + 1}. ${team.team_name} (ID: ${team.team_id})`);
        });

        // 3. 标记所有现有比赛为第一届
        await sequelize.query(`
            UPDATE matches 
            SET edition = 1
            WHERE edition IS NULL OR edition = 0
        `);

        const [count] = await sequelize.query(`
            SELECT COUNT(*) as total FROM matches WHERE edition = 1
        `);

        console.log(`\n✅ Marked all existing matches as Edition 1`);
        console.log(`   Total: ${count[0].total} matches\n`);

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }

    process.exit(0);
}

addEditionField();
