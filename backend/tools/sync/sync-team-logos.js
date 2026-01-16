require('dotenv').config();
const axios = require('axios');
const { sequelize } = require('../../src/config/database');

const STEAM_API_KEY = process.env.STEAM_API_KEY;

/**
 * 获取战队信息（包含 logo）
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
        if (teams.length > 0 && teams[0].logo) {
            // 使用正确的 Steam UGC URL 格式
            const logoUrl = `https://steamuserimages-a.akamaihd.net/ugc/${teams[0].logo}/`;
            return {
                team_id: teamId,
                team_name: teams[0].name,
                logo_url: logoUrl,
                logo_id: teams[0].logo
            };
        }
        return null;
    } catch (error) {
        console.error(`❌ Failed to fetch team ${teamId}:`, error.message);
        return null;
    }
}

/**
 * 同步所有战队的 logo
 */
async function syncTeamLogos() {
    console.log('🚀 Starting team logo synchronization...\n');

    try {
        // 1. 获取所有唯一的战队 ID
        const [teams] = await sequelize.query(`
            SELECT DISTINCT team_id, team_name
            FROM (
                SELECT radiant_team_id as team_id, radiant_team_name as team_name
                FROM matches
                WHERE radiant_team_id IS NOT NULL
                UNION
                SELECT dire_team_id as team_id, dire_team_name as team_name
                FROM matches
                WHERE dire_team_id IS NOT NULL
            ) t
            ORDER BY team_id
        `);

        console.log(`📊 Found ${teams.length} unique teams\n`);

        let updated = 0;
        let failed = 0;

        // 2. 为每个战队获取 logo
        for (const team of teams) {
            console.log(`Fetching logo for ${team.team_name} (ID: ${team.team_id})...`);

            const teamInfo = await fetchTeamInfo(team.team_id);

            if (teamInfo && teamInfo.logo_url) {
                // 3. 更新数据库
                await sequelize.query(`
                    UPDATE matches
                    SET radiant_team_logo_url = ?
                    WHERE radiant_team_id = ?
                `, {
                    replacements: [teamInfo.logo_url, team.team_id]
                });

                await sequelize.query(`
                    UPDATE matches
                    SET dire_team_logo_url = ?
                    WHERE dire_team_id = ?
                `, {
                    replacements: [teamInfo.logo_url, team.team_id]
                });

                console.log(`  ✅ ${team.team_name}: ${teamInfo.logo_url}`);
                updated++;
            } else {
                console.log(`  ⚠️  ${team.team_name}: No logo found`);
                failed++;
            }

            // 避免 API 限流
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`\n📊 Summary:`);
        console.log(`  Total teams: ${teams.length}`);
        console.log(`  Logos updated: ${updated}`);
        console.log(`  No logo found: ${failed}`);
        console.log(`\n✅ Team logo synchronization completed!`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }

    process.exit(0);
}

syncTeamLogos();
