// 从 OpenDota API 获取英雄数据并生成映射
const axios = require('axios');
const fs = require('fs');

async function generateHeroMapping() {
    try {
        const response = await axios.get('https://api.opendota.com/api/heroes');
        const heroes = response.data;

        console.log('获取到', heroes.length, '个英雄');

        // 生成 ID 到名称的映射
        const heroMap = {};
        heroes.forEach(hero => {
            // 移除 "npc_dota_hero_" 前缀
            const name = hero.name.replace('npc_dota_hero_', '');
            heroMap[hero.id] = name;
        });

        // 输出为 JavaScript 对象
        const output = `// 英雄ID到名称的映射 (自动生成)
const HERO_ID_TO_NAME = ${JSON.stringify(heroMap, null, 2)};

/**
 * 获取英雄头像 URL
 * @param {number} heroId - 英雄ID
 * @returns {string} 英雄头像URL
 */
const getHeroIconUrl = (heroId) => {
  const heroName = HERO_ID_TO_NAME[heroId];
  if (!heroName) {
    return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/npc_dota_hero_antimage.png';
  }
  return \`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/\${heroName}.png\`;
};

module.exports = { HERO_ID_TO_NAME, getHeroIconUrl };
`;

        fs.writeFileSync('hero-mapping.js', output);
        console.log('映射已保存到 hero-mapping.js');
        console.log('\n前10个英雄示例:');
        console.log(JSON.stringify(Object.fromEntries(Object.entries(heroMap).slice(0, 10)), null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

generateHeroMapping();
