const { sequelize } = require('./src/models');

async function runMigration() {
    try {
        console.log('🔄 开始添加解析状态字段...\n');

        // 添加 parse_requested 字段
        console.log('1️⃣ 添加 parse_requested 字段...');
        await sequelize.query(`
            ALTER TABLE matches 
            ADD COLUMN parse_requested TINYINT(1) DEFAULT 0 NOT NULL 
            COMMENT '是否已请求OpenDota解析'
        `);
        console.log('   ✅ parse_requested 字段已添加\n');

        // 添加 is_parsed 字段
        console.log('2️⃣ 添加 is_parsed 字段...');
        await sequelize.query(`
            ALTER TABLE matches 
            ADD COLUMN is_parsed TINYINT(1) DEFAULT 0 NOT NULL 
            COMMENT '是否已完全解析（有objectives数据）'
        `);
        console.log('   ✅ is_parsed 字段已添加\n');

        // 添加 parse_requested_at 字段
        console.log('3️⃣ 添加 parse_requested_at 字段...');
        await sequelize.query(`
            ALTER TABLE matches 
            ADD COLUMN parse_requested_at DATETIME NULL 
            COMMENT '请求解析的时间'
        `);
        console.log('   ✅ parse_requested_at 字段已添加\n');

        // 添加索引
        console.log('4️⃣ 添加 is_parsed 索引...');
        await sequelize.query(`
            ALTER TABLE matches 
            ADD INDEX idx_is_parsed (is_parsed)
        `);
        console.log('   ✅ idx_is_parsed 索引已添加\n');

        console.log('✅ 所有字段添加完成！');

        await sequelize.close();
        console.log('🔌 数据库连接已关闭');

    } catch (error) {
        console.error('❌ 迁移失败:', error.message);

        // 如果是字段已存在的错误，显示友好提示
        if (error.message.includes('Duplicate column name')) {
            console.log('\nℹ️  字段可能已经存在，请运行 verify-parse-fields.js 检查');
        }

        process.exit(1);
    }
}

runMigration();
