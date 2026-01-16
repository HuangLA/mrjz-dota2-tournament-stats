// 简化版：使用 axios 下载英雄图标
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const missingHeroes = ['hoodwink', 'void_spirit', 'mars', 'marci', 'primal_beast', 'muerta'];
const outputDir = path.join(__dirname, 'public', 'assets', 'heroes');

// 多个 CDN 源
const cdnSources = [
    (hero) => `https://steamcdn-a.akamaihd.net/apps/dota2/images/dota_react/heroes/${hero}.png`,
    (hero) => `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/heroes/${hero}_full.png`,
    (hero) => `https://api.opendota.com/apps/dota2/images/heroes/${hero}_full.png`
];

async function downloadHero(heroName) {
    for (let i = 0; i < cdnSources.length; i++) {
        const url = cdnSources[i](heroName);
        const outputPath = path.join(outputDir, `${heroName}.png`);

        try {
            console.log(`Trying source ${i + 1} for ${heroName}...`);
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 10000,
                maxRedirects: 5
            });

            fs.writeFileSync(outputPath, response.data);
            console.log(`✅ ${heroName}.png saved from source ${i + 1}`);
            return true;
        } catch (err) {
            console.log(`❌ Source ${i + 1} failed: ${err.message}`);
        }
    }

    console.log(`❌ All sources failed for ${heroName}`);
    return false;
}

async function main() {
    console.log('开始下载缺失的英雄图标...\n');

    for (const hero of missingHeroes) {
        await downloadHero(hero);
        console.log('');
    }

    console.log('下载完成！');
}

main();
