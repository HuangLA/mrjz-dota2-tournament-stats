/**
 * 英雄资源管理工具
 * 用途：检查并下载缺失的英雄头像
 * 使用：node scripts/update-hero-assets.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const HEROES_DIR = path.join(__dirname, '..', 'public', 'assets', 'heroes');
const HERO_MAPPING_PATH = path.join(__dirname, '..', 'src', 'utils', 'heroMapping.js');

// 确保目录存在
if (!fs.existsSync(HEROES_DIR)) {
    fs.mkdirSync(HEROES_DIR, { recursive: true });
}

/**
 * 从 OpenDota API 获取最新英雄列表
 */
async function fetchHeroList() {
    try {
        const response = await axios.get('https://api.opendota.com/api/heroes');
        return response.data;
    } catch (error) {
        console.error('❌ 获取英雄列表失败:', error.message);
        throw error;
    }
}

/**
 * 下载单个英雄头像
 */
function downloadHeroIcon(heroName) {
    return new Promise((resolve, reject) => {
        const url = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png`;
        const outputPath = path.join(HEROES_DIR, `${heroName}.png`);

        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const fileStream = fs.createWriteStream(outputPath);
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve();
                });
            } else {
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', reject);
    });
}

/**
 * 生成英雄映射文件
 */
function generateHeroMapping(heroes) {
    const heroMap = {};
    heroes.forEach(hero => {
        const name = hero.name.replace('npc_dota_hero_', '');
        heroMap[hero.id] = name;
    });

    const content = `// 英雄ID到名称的映射 (自动生成于 ${new Date().toISOString()})
export const HERO_ID_TO_NAME = ${JSON.stringify(heroMap, null, 2)};

/**
 * 获取英雄头像 URL
 * @param {number} heroId - 英雄ID
 * @returns {string} 英雄头像URL
 */
export const getHeroIconUrl = (heroId) => {
    const heroName = HERO_ID_TO_NAME[heroId];
    if (!heroName) {
        console.warn(\`Unknown hero ID: \${heroId}\`);
        return '/assets/heroes/default.png';
    }
    return \`/assets/heroes/\${heroName}.png\`;
};

/**
 * 获取英雄名称
 * @param {number} heroId - 英雄ID
 * @returns {string} 英雄名称
 */
export const getHeroName = (heroId) => {
    return HERO_ID_TO_NAME[heroId] || 'Unknown Hero';
};
`;

    fs.writeFileSync(HERO_MAPPING_PATH, content, 'utf8');
}

/**
 * 主函数
 */
async function main() {
    console.log('🔍 检查英雄资源...\n');

    try {
        // 1. 获取最新英雄列表
        console.log('📡 从 OpenDota API 获取英雄列表...');
        const heroes = await fetchHeroList();
        console.log(`✅ 获取到 ${heroes.length} 个英雄\n`);

        // 2. 检查本地已有的头像
        const localHeroes = fs.readdirSync(HEROES_DIR)
            .filter(f => f.endsWith('.png'))
            .map(f => f.replace('.png', ''));
        console.log(`📁 本地已有 ${localHeroes.length} 个英雄头像\n`);

        // 3. 找出缺失的头像
        const missingHeroes = heroes.filter(hero => {
            const name = hero.name.replace('npc_dota_hero_', '');
            return !localHeroes.includes(name);
        });

        if (missingHeroes.length === 0) {
            console.log('✅ 所有英雄头像都已存在！\n');
        } else {
            console.log(`⚠️  发现 ${missingHeroes.length} 个缺失的英雄头像：`);
            missingHeroes.forEach(hero => {
                const name = hero.name.replace('npc_dota_hero_', '');
                console.log(`   - ${hero.localized_name} (${name})`);
            });
            console.log('');

            // 4. 下载缺失的头像
            console.log('📥 开始下载缺失的头像...\n');
            for (const hero of missingHeroes) {
                const name = hero.name.replace('npc_dota_hero_', '');
                try {
                    await downloadHeroIcon(name);
                    console.log(`✅ ${hero.localized_name} (${name})`);
                } catch (error) {
                    console.error(`❌ ${hero.localized_name} (${name}): ${error.message}`);
                }
            }
            console.log('');
        }

        // 5. 更新映射文件
        console.log('📝 更新英雄映射文件...');
        generateHeroMapping(heroes);
        console.log(`✅ 映射文件已更新: ${HERO_MAPPING_PATH}\n`);

        console.log('🎉 英雄资源更新完成！');

    } catch (error) {
        console.error('❌ 更新失败:', error.message);
        process.exit(1);
    }
}

// 运行
main();
