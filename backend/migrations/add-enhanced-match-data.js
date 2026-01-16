require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function migrate() {
    console.log('🔄 Adding enhanced match data columns...\n');

    const newColumns = [
        { name: 'item_backpack_0', type: 'INT DEFAULT NULL' },
        { name: 'item_backpack_1', type: 'INT DEFAULT NULL' },
        { name: 'item_backpack_2', type: 'INT DEFAULT NULL' },
        { name: 'item_neutral', type: 'INT DEFAULT NULL' },
        { name: 'lane', type: 'TINYINT DEFAULT NULL' },
        { name: 'net_worth', type: 'INT DEFAULT 0' },
        { name: 'last_hits', type: 'INT DEFAULT 0' },
        { name: 'denies', type: 'INT DEFAULT 0' }
    ];

    for (const col of newColumns) {
        try {
            await sequelize.query(`ALTER TABLE match_players ADD COLUMN ${col.name} ${col.type}`);
            console.log(`  ✓ Added ${col.name}`);
        } catch (error) {
            if (error.message.includes('Duplicate column')) {
                console.log(`  ⚠️  ${col.name} already exists`);
            } else {
                console.error(`  ❌ Error adding ${col.name}:`, error.message);
                throw error;
            }
        }
    }

    console.log('\n✅ Migration completed!');
    process.exit(0);
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
