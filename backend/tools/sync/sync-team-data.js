require('dotenv').config();
const axios = require('axios');
const { sequelize } = require('../../src/config/database');
const { Match } = require('../../src/models');

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const LEAGUE_ID = 17485;

/**
 * 从 GetMatchHistory 获取比赛列表（包含队伍 ID）
 */
async function fetchMatchHistory() {
    const url = 'http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1';

    try {
        const response = await axios.get(url, {
            params: {
                key: STEAM_API_KEY,
                league_id: LEAGUE_ID,
                matches_requested: 100
            },
            timeout: 10000
        });

        const matches = response.data.result?.matches || [];
        console.log(`✅ Fetched ${matches.length} matches from GetMatchHistory`);

        return matches.map(m => ({
            match_id: m.match_id,
            radiant_team_id: m.radiant_team_id || null,
            dire_team_id: m.dire_team_id || null
        }));
    } catch (error) {
        console.error('❌ Failed to fetch match history:', error.message);
        return [];
    }
}

/**
 * 获取队伍信息
 */
async function fetchTeamInfo(teamId) {
    const url = 'http://api.steampowered.com/IDOTA2Match_570/GetTeamInfoByTeamID/v1';

    try {
        const response = await axios.get(url, {
            params: {
                key: STEAM_API_KEY,
                start_at_team_id: teamId,
                teams_requested: 1
            },
            timeout: 10000
        });

        const teams = response.data.result?.teams || [];
        if (teams.length > 0) {
            // API 返回的数据中没有 team_id 字段，但我们知道请求的是哪个队伍
            return {
                team_id: teamId,  // 使用请求的 teamId
                team_name: teams[0].name,
                team_tag: teams[0].tag || ''
            };
        }
        return null;
    } catch (error) {
        console.error(`❌ Failed to fetch team ${teamId}:`, error.message);
        return null;
    }
}

/**
 * 主函数
 */
async function syncTeamData() {
    console.log('🚀 Starting team data synchronization...\n');

    // 1. 获取比赛历史
    console.log('📥 Step 1: Fetching match history from Valve API...');
    const matchHistory = await fetchMatchHistory();

    if (matchHistory.length === 0) {
        console.log('⚠️  No matches found');
        process.exit(0);
    }

    // 2. 收集所有唯一的队伍 ID
    console.log('\n📊 Step 2: Collecting unique team IDs...');
    const teamIds = new Set();
    matchHistory.forEach(match => {
        if (match.radiant_team_id) teamIds.add(match.radiant_team_id);
        if (match.dire_team_id) teamIds.add(match.dire_team_id);
    });
    console.log(`Found ${teamIds.size} unique teams`);

    // 3. 获取队伍信息
    console.log('\n📥 Step 3: Fetching team information...');
    const teamInfo = new Map();
    let fetchedCount = 0;

    for (const teamId of teamIds) {
        const info = await fetchTeamInfo(teamId);
        if (info) {
            teamInfo.set(teamId, info);
            fetchedCount++;
            console.log(`  ✅ ${info.team_name} (${info.team_tag})`);
        }
        // 避免 API 限流
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log(`Successfully fetched ${fetchedCount}/${teamIds.size} teams`);

    // 4. 更新数据库
    console.log('\n💾 Step 4: Updating database...');
    let updateCount = 0;

    for (const match of matchHistory) {
        try {
            // 检查比赛是否存在于数据库
            const existingMatch = await Match.findByPk(match.match_id);
            if (!existingMatch) {
                console.log(`  ⚠️  Match ${match.match_id} not in database, skipping`);
                continue;
            }

            const radiantTeam = teamInfo.get(match.radiant_team_id);
            const direTeam = teamInfo.get(match.dire_team_id);

            await Match.update({
                radiant_team_id: match.radiant_team_id,
                radiant_team_name: radiantTeam?.team_name || null,
                dire_team_id: match.dire_team_id,
                dire_team_name: direTeam?.team_name || null
            }, {
                where: { match_id: match.match_id }
            });

            console.log(`  ✅ ${match.match_id}: ${radiantTeam?.team_name || 'Unknown'} vs ${direTeam?.team_name || 'Unknown'}`);
            updateCount++;
        } catch (error) {
            console.error(`  ❌ Failed to update match ${match.match_id}:`, error.message);
        }
    }

    console.log(`\n\n📈 Summary:`);
    console.log(`  📊 Matches from API: ${matchHistory.length}`);
    console.log(`  👥 Unique teams: ${teamIds.size}`);
    console.log(`  ✅ Teams fetched: ${fetchedCount}`);
    console.log(`  💾 Matches updated: ${updateCount}`);

    process.exit(0);
}

// 运行脚本
syncTeamData().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
