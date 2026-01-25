const steamService = require('./steamService');
const achievementService = require('./achievementService');
const { Match, Player, MatchPlayer, Hero, SyncLog } = require('../models');

class SyncService {
    constructor() {
        // 同步状态管理
        this.syncStatus = {
            isRunning: false,
            progress: { current: 0, total: 0 },
            currentMatch: null,
            startTime: null,
            error: null,
            leagueId: null
        };
    }

    /**
     * 获取当前同步状态
     * @returns {Object} 同步状态信息
     */
    getSyncStatus() {
        return {
            ...this.syncStatus,
            duration: this.syncStatus.startTime
                ? Date.now() - this.syncStatus.startTime
                : 0
        };
    }

    /**
     * 更新同步进度
     * @param {number} current - 当前进度
     * @param {number} total - 总数
     * @param {Object} matchInfo - 当前比赛信息
     */
    updateProgress(current, total, matchInfo = null) {
        this.syncStatus.progress = { current, total };
        this.syncStatus.currentMatch = matchInfo;

        if (matchInfo) {
            console.log(`📊 Progress: ${current}/${total} - Match ${matchInfo.matchId}`);
        }
    }

    /**
     * 重置同步状态
     */
    resetSyncStatus() {
        this.syncStatus = {
            isRunning: false,
            progress: { current: 0, total: 0 },
            currentMatch: null,
            startTime: null,
            error: null,
            leagueId: null
        };
    }

    /**
     * 同步比赛数据（增量更新）
     * @param {number} leagueId - 联赛ID
     * @returns {Promise<Object>} 同步结果
     */
    async syncMatches(leagueId) {
        const startTime = Date.now();
        let syncedCount = 0;
        let errorMessage = null;

        // 初始化同步状态
        this.syncStatus = {
            isRunning: true,
            progress: { current: 0, total: 0 },
            currentMatch: null,
            startTime: Date.now(),
            error: null,
            leagueId
        };

        try {
            console.log(`🔄 Starting match sync for league ${leagueId}...`);

            // 1. 从 Steam API 获取联赛所有比赛（包含战队 ID）
            const allMatches = await steamService.getMatchHistory(leagueId);
            console.log(`📊 Found ${allMatches.length} matches from Steam API`);

            // 2. 查询数据库已有的比赛 ID
            const existingMatches = await Match.findAll({
                where: { league_id: leagueId },
                attributes: ['match_id']
            });
            const existingMatchIds = existingMatches.map(m => m.match_id);
            console.log(`💾 Found ${existingMatchIds.length} existing matches in database`);

            // 3. 计算需要同步的新比赛（增量更新）
            const newMatches = allMatches.filter(m => !existingMatchIds.includes(m.match_id));
            console.log(`✨ ${newMatches.length} new matches to sync`);

            // 更新总数
            this.updateProgress(0, newMatches.length);

            if (newMatches.length === 0) {
                console.log('✅ No new matches to sync');
                this.syncStatus.isRunning = false;
                await this.logSync('match', 'success', null, 0);
                return { synced: 0, total: allMatches.length };
            }


            // 4. 顺序获取新比赛详情（避免触发 API 限流）
            console.log('⏳ Syncing matches sequentially to avoid rate limiting...\n');

            for (let i = 0; i < newMatches.length; i++) {
                const match = newMatches[i];

                try {
                    console.log(`[${i + 1}/${newMatches.length}] Syncing match ${match.match_id}...`);

                    // 更新当前同步的比赛信息
                    this.updateProgress(i, newMatches.length, {
                        matchId: match.match_id,
                        index: i + 1
                    });

                    await this.syncSingleMatch(match.match_id, leagueId);
                    syncedCount++;

                    // 更新完成进度
                    this.updateProgress(i + 1, newMatches.length, {
                        matchId: match.match_id,
                        index: i + 1
                    });

                    console.log(`✅ Match ${match.match_id} synced successfully`);
                } catch (error) {
                    console.error(`❌ Failed to sync match ${match.match_id}: ${error.message}`);
                    // 继续同步下一场比赛，不中断整个流程
                }

                // 延迟 2-3 秒避免 API 限流
                if (i < newMatches.length - 1) {
                    const delay = 2000 + Math.random() * 1000; // 2-3秒随机延迟
                    console.log(`⏱️  Waiting ${(delay / 1000).toFixed(1)}s before next request...\n`);
                    await this.sleep(delay);
                }
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ Match sync completed in ${duration}s. Synced ${syncedCount}/${newMatches.length} matches`);

            // 5. 同步战队信息
            console.log('\n👥 Syncing team information...');
            await this.syncTeamData(leagueId, newMatches);

            // 记录同步日志
            await this.logSync('match', 'success', null, syncedCount);

        } catch (error) {
            errorMessage = error.message;
            console.error('❌ Match sync failed:', error.message);
            await this.logSync('match', 'failed', errorMessage, syncedCount);
            throw error;
        } finally {
            this.syncStatus.isRunning = false;
        }
    }

    /**
     * 同步单场比赛
     */
    async syncSingleMatch(matchId, leagueId = null) {
        try {
            // 1. 获取比赛详情
            const matchData = await steamService.getMatchDetails(matchId);
            if (!matchData) {
                console.warn(`⚠️ No data for match ${matchId}`);
                return { success: false, error: 'No match data available' };
            }

            // 检查是否已解析（有objectives数据）
            const isParsed = matchData.objectives !== undefined;
            console.log(`📊 Match ${matchId} parse status: ${isParsed ? 'PARSED' : 'NOT PARSED'}`);

            // 2. 查找或创建比赛记录
            const [match, created] = await Match.findOrCreate({
                where: { match_id: matchData.match_id },
                defaults: {
                    match_id: matchData.match_id,
                    league_id: leagueId || matchData.leagueid,
                    start_time: matchData.start_time,
                    duration: matchData.duration,
                    radiant_win: matchData.radiant_win,
                    radiant_score: matchData.radiant_score || 0,
                    dire_score: matchData.dire_score || 0,
                    game_mode: matchData.game_mode,
                    is_parsed: isParsed
                }
            });

            // 如果比赛已存在，更新解析状态和基本信息
            if (!created) {
                await match.update({
                    is_parsed: isParsed,
                    radiant_score: matchData.radiant_score || 0,
                    dire_score: matchData.dire_score || 0,
                    duration: matchData.duration
                });
                console.log(`🔄 Updated existing match ${matchId}, is_parsed: ${isParsed}`);
            } else {
                console.log(`✨ Created new match ${matchId}, is_parsed: ${isParsed}`);
            }

            // 3. 处理选手数据并创建 player_id 映射
            const players = matchData.players || [];
            const playerIdMap = {}; // account_id -> player_id 映射

            // 如果是新创建的比赛，需要同步选手数据
            if (created) {
                for (const playerData of players) {
                    // 确保选手存在并获取 player 对象
                    const player = await this.ensurePlayer(playerData.account_id);
                    playerIdMap[playerData.account_id] = player.player_id;

                    // 保存比赛选手详情（使用正确的 player_id）
                    await MatchPlayer.create({
                        match_id: matchData.match_id,
                        player_id: player.player_id, // 使用数据库中的 player_id
                        hero_id: playerData.hero_id,
                        team: playerData.player_slot < 128 ? 'radiant' : 'dire',
                        kills: playerData.kills || 0,
                        deaths: playerData.deaths || 0,
                        assists: playerData.assists || 0,
                        gpm: playerData.gold_per_min || 0,
                        xpm: playerData.xp_per_min || 0,
                        items: this.extractItems(playerData),
                        ability_upgrades: playerData.ability_upgrades || [],
                        hero_damage: playerData.hero_damage || 0,
                        tower_damage: playerData.tower_damage || 0,
                        hero_healing: playerData.hero_healing || 0,
                        // 背包装备
                        item_backpack_0: playerData.backpack_0 || null,
                        item_backpack_1: playerData.backpack_1 || null,
                        item_backpack_2: playerData.backpack_2 || null,
                        // 中立装备
                        item_neutral: playerData.item_neutral || null,
                        // 路线信息
                        lane: playerData.lane || null,
                        // 经济数据
                        net_worth: playerData.net_worth || 0,
                        last_hits: playerData.last_hits || 0,
                        denies: playerData.denies || 0
                    });
                }
            } else {
                // 如果是更新，只需要获取现有的player_id映射
                for (const playerData of players) {
                    const player = await Player.findOne({
                        where: { steam_id: playerData.account_id.toString() }
                    });
                    if (player) {
                        playerIdMap[playerData.account_id] = player.player_id;
                    }
                }
            }

            // 4. 检测并保存成就（只有在比赛已解析时才检测）
            if (isParsed) {
                const processedMatchData = {
                    ...matchData,
                    match_id: matchData.match_id,
                    radiant_win: matchData.radiant_win,
                    objectives: matchData.objectives, // 传递objectives数据
                    players: players.map(p => ({
                        player_id: playerIdMap[p.account_id], // 使用数据库中的 player_id
                        account_id: p.account_id,
                        player_slot: p.player_slot,
                        team: p.player_slot < 128 ? 'radiant' : 'dire',
                        kills: p.kills || 0,
                        deaths: p.deaths || 0,
                        assists: p.assists || 0,
                        multi_kills: p.multi_kills || {},
                        kill_streaks: p.kill_streaks || {},
                        firstblood_claimed: p.firstblood_claimed || 0
                    }))
                };
                await achievementService.detectAndSaveAchievements(processedMatchData);
                console.log(`🏆 Achievement detection completed for match ${matchId}`);
            } else {
                console.log(`⚠️ Skipping achievement detection for unparsed match ${matchId}`);
            }

            console.log(`✅ Synced match ${matchId}`);
            return { success: true, isParsed };

        } catch (error) {
            console.error(`❌ Failed to sync match ${matchId}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 确保选手存在（不存在则创建并获取信息）
     */
    async ensurePlayer(accountId) {
        if (!accountId) return;

        // 查找或创建选手
        const [player, created] = await Player.findOrCreate({
            where: { steam_id: accountId },
            defaults: {
                steam_id: accountId,
                nickname: `Player_${accountId}`,
                avatar_url: null
            }
        });

        // 如果是新创建的选手，或者昵称还是占位符，则获取真实信息
        if (created || player.nickname.startsWith('Player_')) {
            try {
                console.log(`📥 Fetching player info for ${accountId}...`);

                // 将32位 account_id 转换为64位 Steam ID
                const steamId64 = this.accountIdToSteamId64(accountId);
                const playerInfo = await steamService.getPlayerSummaries(steamId64);

                if (playerInfo) {
                    await player.update({
                        nickname: playerInfo.personaname || `Player_${accountId}`,
                        avatar_url: playerInfo.avatarfull || playerInfo.avatar || null
                    });
                    console.log(`✅ Updated player info: ${playerInfo.personaname}`);
                }
            } catch (error) {
                console.error(`⚠️  Failed to fetch player info for ${accountId}:`, error.message);
                // 继续执行，使用占位符信息
            }
        }

        return player;
    }

    /**
     * 将 Dota 2 account_id (32位) 转换为 Steam ID 64位
     */
    accountIdToSteamId64(accountId) {
        const STEAM_ID_BASE = BigInt('76561197960265728');
        return (STEAM_ID_BASE + BigInt(accountId)).toString();
    }

    /**
     * 同步战队数据（名称）
     * 从 GetMatchHistory 获取的战队 ID 批量获取战队名称并更新数据库
     */
    async syncTeamData(leagueId, matches) {
        try {
            // 1. 收集所有唯一的战队 ID
            const teamIds = new Set();
            matches.forEach(match => {
                if (match.radiant_team_id) teamIds.add(match.radiant_team_id);
                if (match.dire_team_id) teamIds.add(match.dire_team_id);
            });

            if (teamIds.size === 0) {
                console.log('  ⚠️  No team IDs found in matches');
                return;
            }

            console.log(`  📊 Found ${teamIds.size} unique teams`);

            // 2. 获取战队信息
            const teamInfo = new Map();
            let fetchedCount = 0;

            for (const teamId of teamIds) {
                const info = await steamService.getTeamInfo(teamId);
                if (info) {
                    teamInfo.set(teamId, info);
                    fetchedCount++;
                    console.log(`  ✅ ${info.team_name} (ID: ${info.team_id})`);
                } else {
                    console.log(`  ⚠️  Failed to fetch team ${teamId}`);
                }
                // 避免 API 限流
                await this.sleep(1000);
            }

            console.log(`  📈 Successfully fetched ${fetchedCount}/${teamIds.size} teams`);

            // 3. 更新数据库中的战队信息
            let updateCount = 0;
            for (const match of matches) {
                try {
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

                    updateCount++;
                } catch (error) {
                    console.error(`  ❌ Failed to update match ${match.match_id}:`, error.message);
                }
            }

            console.log(`  💾 Updated ${updateCount}/${matches.length} matches with team data`);
        } catch (error) {
            console.warn(`⚠️ Failed to sync team data:`, error.message);
            // 不抛出错误，允许比赛同步继续
        }
    }

    /**
     * 获取战队信息
     */
    async fetchTeamInfo(teamId, apiKey) {
        try {
            const axios = require('axios');
            const url = 'http://api.steampowered.com/IDOTA2Match_570/GetTeamInfoByTeamID/v1';

            const response = await axios.get(url, {
                params: {
                    key: apiKey,
                    start_at_team_id: teamId,
                    teams_requested: 1
                },
                timeout: 10000
            });

            const teams = response.data.result?.teams || [];
            if (teams.length > 0) {
                const team = teams[0];
                return {
                    name: team.name
                };
            }
            return null;
        } catch (error) {
            console.warn(`⚠️ Failed to fetch team ${teamId}:`, error.message);
            return null;
        }
    }

    /**
     * 提取物品列表
     */
    extractItems(playerData) {
        const items = [];
        for (let i = 0; i < 6; i++) {
            const itemKey = `item_${i}`;
            if (playerData[itemKey]) {
                items.push(playerData[itemKey]);
            }
        }
        return items;
    }

    /**
     * 同步英雄数据
     */
    async syncHeroes() {
        try {
            console.log('🔄 Starting hero sync...');

            const heroes = await steamService.getHeroes();

            for (const heroData of heroes) {
                await Hero.upsert({
                    hero_id: heroData.id,
                    name: heroData.name,
                    localized_name: heroData.localized_name,
                    icon_url: this.generateHeroIconUrl(heroData.name)
                });
            }

            console.log(`✅ Synced ${heroes.length} heroes`);
            await this.logSync('hero', 'success', null, heroes.length);

            return heroes.length;

        } catch (error) {
            console.error('❌ Hero sync failed:', error.message);
            await this.logSync('hero', 'failed', error.message, 0);
            throw error;
        }
    }

    /**
     * 生成英雄头像URL
     */
    generateHeroIconUrl(heroName) {
        // 移除 "npc_dota_hero_" 前缀
        const shortName = heroName.replace('npc_dota_hero_', '');
        return `https://cdn.dota2.com/apps/dota2/images/heroes/${shortName}_lg.png`;
    }

    /**
     * 记录同步日志
     */
    async logSync(type, status, errorMessage, count) {
        try {
            await SyncLog.create({
                sync_type: type,
                status: status,
                error_message: errorMessage,
                synced_count: count
            });
        } catch (error) {
            console.error('Failed to log sync:', error.message);
        }
    }

    /**
     * 强制刷新比赛数据（删除后重新同步）
     * @param {number} leagueId - 联赛ID
     * @returns {Promise<Object>} 同步结果
     */
    async forceRefreshMatches(leagueId) {
        const startTime = Date.now();

        try {
            console.log(`🔄 Starting force refresh for league ${leagueId}...`);

            // 1. 查询现有比赛数量
            const existingCount = await Match.count({
                where: { league_id: leagueId }
            });
            console.log(`📊 Found ${existingCount} existing matches in database`);

            // 2. 删除现有比赛数据（级联删除 match_players）
            if (existingCount > 0) {
                console.log(`🗑️  Deleting ${existingCount} existing matches...`);
                await Match.destroy({
                    where: { league_id: leagueId }
                });
                console.log(`✅ Deleted ${existingCount} matches`);
            }

            // 3. 重新同步所有比赛
            console.log(`\n📡 Re-syncing all matches from OpenDota API...\n`);
            const result = await this.syncMatches(leagueId);

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`\n✅ Force refresh completed in ${duration}s`);
            console.log(`📊 Deleted: ${existingCount}, Re-synced: ${result.synced}`);

            return {
                deleted: existingCount,
                synced: result.synced,
                total: result.total,
                duration: parseFloat(duration)
            };

        } catch (error) {
            console.error('❌ Force refresh failed:', error.message);
            throw error;
        }
    }

    /**
     * 延迟函数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new SyncService();
