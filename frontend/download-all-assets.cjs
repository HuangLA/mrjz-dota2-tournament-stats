// 批量下载所有缺失的物品和技能图标
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function downloadAsset(url, outputPath, name) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 15000,
            maxRedirects: 5
        });

        fs.writeFileSync(outputPath, response.data);
        return { success: true, name };
    } catch (err) {
        return { success: false, name, error: err.message };
    }
}

async function downloadMissingAssets() {
    console.log('开始下载缺失的资源...\n');

    // 1. 获取缺失的物品列表
    console.log('1. 获取物品列表...');
    const itemsDir = path.join(__dirname, 'public', 'assets', 'items');
    const localItems = fs.readdirSync(itemsDir)
        .filter(f => f.endsWith('.png'))
        .map(f => f.replace('.png', ''));

    const itemsResponse = await axios.get('https://api.opendota.com/api/constants/items');
    const apiItems = Object.keys(itemsResponse.data);
    const missingItems = apiItems.filter(item => !localItems.includes(item));

    console.log(`   缺失物品: ${missingItems.length} 个\n`);

    // 2. 下载物品
    console.log('2. 下载物品图标...');
    let itemSuccess = 0;
    let itemFailed = 0;

    for (let i = 0; i < missingItems.length; i++) {
        const item = missingItems[i];
        const url = `https://steamcdn-a.akamaihd.net/apps/dota2/images/dota_react/items/${item}.png`;
        const outputPath = path.join(itemsDir, `${item}.png`);

        const result = await downloadAsset(url, outputPath, item);
        if (result.success) {
            itemSuccess++;
            process.stdout.write(`\r   进度: ${i + 1}/${missingItems.length} | 成功: ${itemSuccess} | 失败: ${itemFailed}`);
        } else {
            itemFailed++;
        }

        // 每10个请求延迟一下，避免被限流
        if ((i + 1) % 10 === 0) {
            await delay(500);
        }
    }

    console.log(`\n   ✅ 物品下载完成: ${itemSuccess}/${missingItems.length}\n`);

    // 3. 下载关键技能（只下载英雄技能，不下载天赋和特殊技能）
    console.log('3. 获取技能列表...');
    const abilitiesDir = path.join(__dirname, 'public', 'assets', 'abilities');
    const localAbilities = fs.readdirSync(abilitiesDir)
        .filter(f => f.endsWith('.png'))
        .map(f => f.replace('.png', ''));

    const abilitiesResponse = await axios.get('https://api.opendota.com/api/constants/abilities');
    const apiAbilities = Object.keys(abilitiesResponse.data)
        .filter(ability => {
            // 只下载英雄技能，过滤掉天赋、特殊技能等
            return !ability.includes('special_bonus') &&
                !ability.includes('ability_') &&
                !ability.includes('dota_base') &&
                !ability.includes('twin_gate') &&
                !ability.includes('empty');
        });

    const missingAbilities = apiAbilities.filter(ability => !localAbilities.includes(ability));
    console.log(`   缺失技能: ${missingAbilities.length} 个（已过滤特殊技能）\n`);

    // 4. 下载技能
    console.log('4. 下载技能图标...');
    let abilitySuccess = 0;
    let abilityFailed = 0;

    for (let i = 0; i < missingAbilities.length; i++) {
        const ability = missingAbilities[i];
        const url = `https://steamcdn-a.akamaihd.net/apps/dota2/images/dota_react/abilities/${ability}.png`;
        const outputPath = path.join(abilitiesDir, `${ability}.png`);

        const result = await downloadAsset(url, outputPath, ability);
        if (result.success) {
            abilitySuccess++;
            process.stdout.write(`\r   进度: ${i + 1}/${missingAbilities.length} | 成功: ${abilitySuccess} | 失败: ${abilityFailed}`);
        } else {
            abilityFailed++;
        }

        if ((i + 1) % 10 === 0) {
            await delay(500);
        }
    }

    console.log(`\n   ✅ 技能下载完成: ${abilitySuccess}/${missingAbilities.length}\n`);

    console.log('========================================');
    console.log('下载完成！');
    console.log(`物品: ${itemSuccess}/${missingItems.length}`);
    console.log(`技能: ${abilitySuccess}/${missingAbilities.length}`);
    console.log('========================================');
}

downloadMissingAssets().catch(err => {
    console.error('下载过程出错:', err);
});
