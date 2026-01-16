// 下载最关键的缺失物品（新版本物品）
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 最关键的新物品列表
const criticalItems = [
    'overwhelming_blink',
    'swift_blink',
    'arcane_blink',
    'crown',
    'diadem',
    'blitz_knuckles',
    'voodoo_mask',
    'phylactery',
    'witch_blade',
    'falcon_blade',
    'orb_of_corrosion',
    'ring_of_basilius',
    'fluffy_hat',
    'khanda',
    'disperser',
    'harpoon',
    'pavise',
    'angels_demise',
    'cornucopia',
    'rattlecage'
];

const outputDir = path.join(__dirname, 'public', 'assets', 'items');

async function downloadItem(itemName) {
    const url = `https://steamcdn-a.akamaihd.net/apps/dota2/images/dota_react/items/${itemName}.png`;
    const outputPath = path.join(outputDir, `${itemName}.png`);

    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 10000,
            maxRedirects: 5
        });

        fs.writeFileSync(outputPath, response.data);
        console.log(`✅ ${itemName}.png`);
        return true;
    } catch (err) {
        console.log(`❌ ${itemName}: ${err.message}`);
        return false;
    }
}

async function main() {
    console.log(`开始下载 ${criticalItems.length} 个关键物品图标...\n`);

    let success = 0;
    for (const item of criticalItems) {
        if (await downloadItem(item)) {
            success++;
        }
    }

    console.log(`\n完成！成功: ${success}/${criticalItems.length}`);
}

main();
