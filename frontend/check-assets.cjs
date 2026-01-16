// 从 OpenDota API 获取最新的物品和技能列表，检查缺失
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function checkAssets() {
    console.log('正在检查资源完整性...\n');

    // 检查物品
    try {
        console.log('1. 检查物品图标...');
        const itemsDir = path.join(__dirname, 'public', 'assets', 'items');
        const localItems = fs.readdirSync(itemsDir)
            .filter(f => f.endsWith('.png'))
            .map(f => f.replace('.png', ''));

        console.log(`   本地物品图标: ${localItems.length} 个`);

        // 从 OpenDota 获取物品列表
        const itemsResponse = await axios.get('https://api.opendota.com/api/constants/items');
        const apiItems = Object.keys(itemsResponse.data);
        console.log(`   API 物品列表: ${apiItems.length} 个`);

        const missingItems = apiItems.filter(item => !localItems.includes(item));
        if (missingItems.length > 0) {
            console.log(`   ❌ 缺失 ${missingItems.length} 个物品:`);
            missingItems.slice(0, 10).forEach(item => console.log(`      - ${item}`));
            if (missingItems.length > 10) {
                console.log(`      ... 还有 ${missingItems.length - 10} 个`);
            }
        } else {
            console.log('   ✅ 物品图标完整');
        }

        console.log('');
    } catch (err) {
        console.error('检查物品时出错:', err.message);
    }

    // 检查技能
    try {
        console.log('2. 检查技能图标...');
        const abilitiesDir = path.join(__dirname, 'public', 'assets', 'abilities');
        const localAbilities = fs.readdirSync(abilitiesDir)
            .filter(f => f.endsWith('.png'))
            .map(f => f.replace('.png', ''));

        console.log(`   本地技能图标: ${localAbilities.length} 个`);

        // 从 OpenDota 获取技能列表
        const abilitiesResponse = await axios.get('https://api.opendota.com/api/constants/abilities');
        const apiAbilities = Object.keys(abilitiesResponse.data);
        console.log(`   API 技能列表: ${apiAbilities.length} 个`);

        const missingAbilities = apiAbilities.filter(ability => !localAbilities.includes(ability));
        if (missingAbilities.length > 0) {
            console.log(`   ❌ 缺失 ${missingAbilities.length} 个技能:`);
            missingAbilities.slice(0, 10).forEach(ability => console.log(`      - ${ability}`));
            if (missingAbilities.length > 10) {
                console.log(`      ... 还有 ${missingAbilities.length - 10} 个`);
            }
        } else {
            console.log('   ✅ 技能图标完整');
        }

        console.log('');
    } catch (err) {
        console.error('检查技能时出错:', err.message);
    }
}

checkAssets();
