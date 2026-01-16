// 从 OpenDota API 获取英雄列表并生成 ID 到名称的映射
const axios = require('axios');
const fs = require('fs');

async function generateHeroMapping() {
    try {
        console.log('正在从 OpenDota API 获取英雄列表...');
        const response = await axios.get('https://api.opendota.com/api/heroes');
        const heroes = response.data;

        console.log(`获取到 ${heroes.length} 个英雄`);

        // 生成 ID 到名称的映射
        const heroMap = {};
        heroes.forEach(hero => {
            // 移除 "npc_dota_hero_" 前缀
            const name = hero.name.replace('npc_dota_hero_', '');
            heroMap[hero.id] = name;
        });

        // 生成 JavaScript 文件
        const output = `// 英雄ID到名称的映射 (自动生成自 OpenDota API)
// 生成时间: ${new Date().toISOString()}

export const HERO_ID_TO_NAME = ${JSON.stringify(heroMap, null, 2)};

/**
 * 获取英雄头像 URL (本地资源)
 * @param {number} heroId - 英雄ID
 * @returns {string} 英雄头像URL
 */
export const getHeroIconUrl = (heroId) => {
  const heroName = HERO_ID_TO_NAME[heroId];
  if (!heroName) {
    console.warn(\`Unknown hero ID: \${heroId}\`);
    return '/assets/heroes/antimage_icon.png';
  }
  return \`/assets/heroes/\${heroName}_icon.png\`;
};

/**
 * 获取英雄全身像 URL
 * @param {number} heroId - 英雄ID
 * @returns {string} 英雄全身像URL
 */
export const getHeroFullUrl = (heroId) => {
  const heroName = HERO_ID_TO_NAME[heroId];
  if (!heroName) {
    return '/assets/heroes/antimage_full.png';
  }
  return \`/assets/heroes/\${heroName}_full.png\`;
};
`;

        // 保存到 src/utils 目录
        fs.writeFileSync('src/utils/heroMapping.js', output);
        console.log('✅ 英雄映射已保存到 src/utils/heroMapping.js');

        // 显示前10个英雄作为示例
        console.log('\n前10个英雄示例:');
        Object.entries(heroMap).slice(0, 10).forEach(([id, name]) => {
            console.log(`  ${id}: ${name}`);
        });

    } catch (error) {
        console.error('❌ 错误:', error.message);
    }
}

generateHeroMapping();
