// 从 OpenDota CDN 下载缺失的英雄图标
const https = require('https');
const fs = require('fs');
const path = require('path');

// 缺失的英雄映射
const missingHeroes = {
    123: 'hoodwink',
    126: 'void_spirit',
    128: 'snapfire',
    129: 'mars',
    135: 'dawnbreaker',
    136: 'marci',
    137: 'primal_beast',
    138: 'muerta'
};

const outputDir = path.join(__dirname, 'public', 'assets', 'heroes');

// 确保目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadHeroIcon(heroName) {
    return new Promise((resolve, reject) => {
        // OpenDota CDN URL
        const url = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png`;
        const outputPath = path.join(outputDir, `${heroName}.png`);

        console.log(`Downloading ${heroName}...`);

        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const fileStream = fs.createWriteStream(outputPath);
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log(`✅ ${heroName}.png saved`);
                    resolve();
                });
            } else {
                console.log(`❌ ${heroName} - HTTP ${response.statusCode}`);
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', (err) => {
            console.error(`❌ ${heroName} - ${err.message}`);
            reject(err);
        });
    });
}

async function downloadAll() {
    console.log('开始下载缺失的英雄图标...\n');

    for (const [id, name] of Object.entries(missingHeroes)) {
        try {
            await downloadHeroIcon(name);
        } catch (err) {
            console.error(`Failed to download ${name}:`, err.message);
        }
    }

    console.log('\n下载完成！');
}

downloadAll();
