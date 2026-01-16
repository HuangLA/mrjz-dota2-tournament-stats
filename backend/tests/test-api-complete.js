// 完整的 API 测试 - 使用正确的 ID
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function completeAPITest() {
    console.log('🧪 Complete API Test with Correct IDs\n');
    console.log('='.repeat(60));

    const tests = [
        // 基础
        { name: 'API Root', url: `${BASE_URL}` },
        { name: 'Health Check', url: 'http://localhost:3001/health' },

        // 比赛 API
        { name: 'GET /api/matches', url: `${BASE_URL}/matches?page=1&limit=5` },
        { name: 'GET /api/matches/:id', url: `${BASE_URL}/matches/8329062663` },
        { name: 'GET /api/matches/:id/players', url: `${BASE_URL}/matches/8329062663/players` },
        { name: 'GET /api/matches/:id/achievements', url: `${BASE_URL}/matches/8329062663/achievements` },

        // 选手 API (使用正确的 player_id: 82)
        { name: 'GET /api/players', url: `${BASE_URL}/players?page=1&limit=5` },
        { name: 'GET /api/players/:id', url: `${BASE_URL}/players/82` },
        { name: 'GET /api/players/:id/matches', url: `${BASE_URL}/players/82/matches?page=1&limit=3` },
        { name: 'GET /api/players/:id/achievements', url: `${BASE_URL}/players/82/achievements` },
        { name: 'GET /api/players/:id/stats', url: `${BASE_URL}/players/82/stats` },

        // 英雄 API
        { name: 'GET /api/heroes', url: `${BASE_URL}/heroes` },

        // 成就 API
        { name: 'GET /api/achievements', url: `${BASE_URL}/achievements?page=1&limit=5` },
        { name: 'GET /api/achievements/stats', url: `${BASE_URL}/achievements/stats` },

        // 统计 API
        { name: 'GET /api/stats/overview', url: `${BASE_URL}/stats/overview` },
        { name: 'GET /api/stats/league/:id', url: `${BASE_URL}/stats/league/17485` }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const response = await axios.get(test.url, { timeout: 5000 });

            if (response.data.success !== undefined && response.data.success === true) {
                console.log(`✅ ${test.name}`);
                passed++;
            } else if (response.data.status === 'ok') {
                console.log(`✅ ${test.name}`);
                passed++;
            } else {
                console.log(`⚠️  ${test.name} - Unexpected response format`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} - ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
            }
            failed++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Final Test Results: ${passed}/${tests.length} passed (${(passed / tests.length * 100).toFixed(1)}%)`);

    if (failed === 0) {
        console.log('🎉 All API endpoints working correctly!\n');
    } else {
        console.log(`⚠️  ${failed} endpoints need attention\n`);
    }
}

completeAPITest().catch(console.error);
