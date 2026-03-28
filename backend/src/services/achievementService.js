const { Achievement, Match } = require('../models');

class AchievementService {
    /**
     * 检测并保存比赛的所有成就
     * @param {Object} matchData - 比赛数据
     * @param {number} leagueId - 联赛ID（用于唯一成就判定）
     * @returns {Promise<Array>} 保存的成就列表
     */
    async detectAndSaveAchievements(matchData, leagueId = null) {
        const achievements = [];

        // 0. 清除该比赛已有的成就（避免重复更新导致重复数据）
        await Achievement.destroy({
            where: { match_id: matchData.match_id }
        });

        // 1. 检测个人成就
        for (const player of matchData.players) {
            // 暴虐成狂（Rampage - 5杀）
            if (this.checkRampage(player)) {
                achievements.push(this.createAchievement(
                    matchData.match_id,
                    player.player_id,
                    'rampage',
                    '暴虐成狂',
                    '完成暴走',
                    null,
                    { kills: player.kills }
                ));
            }

            // 旗开得胜（首杀）
            if (this.checkFirstBlood(player, matchData)) {
                achievements.push(this.createAchievement(
                    matchData.match_id,
                    player.player_id,
                    'first_blood',
                    '旗开得胜',
                    '获得首杀',
                    null,
                    null
                ));
            }

            // 虎口夺食（夺取不朽之守护）
            if (this.checkAegisSnatch(player, matchData)) {
                achievements.push(this.createAchievement(
                    matchData.match_id,
                    player.player_id,
                    'aegis_snatch',
                    '虎口夺食',
                    '夺取不朽之守护',
                    null,
                    null
                ));
            }

            // 你也是威少粉丝（三双）
            if (this.checkTripleDouble(player)) {
                achievements.push(this.createAchievement(
                    matchData.match_id,
                    player.player_id,
                    'triple_double',
                    '你也是威少粉丝',
                    '完成三双（击杀、助攻、死亡）',
                    null,
                    { kills: player.kills, assists: player.assists, deaths: player.deaths }
                ));
            }

            // 位列仙班（超神杀戮）
            if (this.checkGodlike(player)) {
                achievements.push(this.createAchievement(
                    matchData.match_id,
                    player.player_id,
                    'godlike',
                    '位列仙班',
                    '完成超神杀戮',
                    null,
                    null
                ));
            }

            // 对不起这把比赛我要赢（Carry全场）
            if (this.checkCarryGame(player, matchData)) {
                const teamKills = this.getTeamKills(matchData, player.team);
                achievements.push(this.createAchievement(
                    matchData.match_id,
                    player.player_id,
                    'carry_game',
                    '对不起这把比赛我要赢',
                    '获胜的比赛中击杀数量超过全队的1/2',
                    null,
                    { kills: player.kills, team_kills: teamKills }
                ));
            }

            // 完美演出（获胜且0死亡）
            if (this.checkPerfectGame(player, matchData)) {
                achievements.push(this.createAchievement(
                    matchData.match_id,
                    player.player_id,
                    'perfect_game',
                    '完美演出',
                    '在获胜的比赛中0死亡',
                    null,
                    null
                ));
            }
        }

        // 2. 检测队伍成就
        // 让让你们的呀（摧毁不朽之守护且获胜）
        if (this.checkAegisVictory(matchData)) {
            const winningTeam = matchData.radiant_win ? 'radiant' : 'dire';
            achievements.push(this.createAchievement(
                matchData.match_id,
                null,
                'aegis_victory',
                '让让你们的呀',
                '摧毁不朽之守护且获得胜利的队伍',
                winningTeam,
                null
            ));
        }

        // 3. 检测隐藏成就（需要 leagueId）
        if (leagueId) {
            // 乐邦詹士（失败比赛最后7秒完成2次击杀）
            const lebronCandidates = await this.checkLeBronJames(matchData, leagueId);
            for (const candidate of lebronCandidates) {
                achievements.push(this.createUniqueAchievement(
                    matchData.match_id,
                    candidate.player_id,
                    'lebron_james',
                    '乐邦詹士',
                    '在失败的比赛中，最后7秒完成2次击杀',
                    leagueId,
                    {
                        kills_count: candidate.kills_count,
                        kills_detail: candidate.kills_detail
                    }
                ));
                console.log(`🏀 "乐邦詹士"成就已授予玩家 ${candidate.player_id}`);
            }
        }

        // 4. 批量保存成就
        if (achievements.length > 0) {
            await Achievement.bulkCreate(achievements);
            console.log(`✅ Saved ${achievements.length} achievements for match ${matchData.match_id}`);
        }

        return achievements;
    }

    /**
     * 创建成就对象
     */
    createAchievement(matchId, playerId, type, name, desc, team, value) {
        return {
            match_id: matchId,
            player_id: playerId,
            achievement_type: type,
            achievement_name: name,
            achievement_desc: desc,
            team: team,
            value: value
        };
    }

    /**
     * 创建唯一成就对象（每届比赛只有第一个完成的人获得）
     */
    createUniqueAchievement(matchId, playerId, type, name, desc, leagueId, value) {
        return {
            match_id: matchId,
            player_id: playerId,
            achievement_type: type,
            achievement_name: name,
            achievement_desc: desc,
            team: null,
            value: value,
            is_unique: true,
            league_id: leagueId
        };
    }

    /**
     * 检测暴虐成狂（5杀）
     * multi_kills是对象，键为连杀数，值为次数
     * 例如: { "2": 3, "5": 1 } 表示双杀3次，五杀1次
     */
    checkRampage(player) {
        return player.multi_kills && player.multi_kills["5"] > 0;
    }

    /**
     * 检测首杀
     * 使用objectives中的CHAT_MESSAGE_FIRSTBLOOD事件
     */
    checkFirstBlood(player, matchData) {
        if (!matchData.objectives) return false;

        return matchData.objectives.some(obj =>
            obj.type === 'CHAT_MESSAGE_FIRSTBLOOD' &&
            obj.player_slot === player.player_slot
        );
    }

    /**
     * 检测虎口夺食（抢夺不朽之守护）
     * 使用objectives中的CHAT_MESSAGE_AEGIS_STOLEN事件
     * OpenDota API已经帮我们判断好了是否是抢盾
     */
    checkAegisSnatch(player, matchData) {
        if (!matchData.objectives) return false;

        // 直接查找AEGIS_STOLEN事件
        return matchData.objectives.some(obj =>
            obj.type === 'CHAT_MESSAGE_AEGIS_STOLEN' &&
            obj.player_slot === player.player_slot
        );
    }

    /**
     * 检测三双（击杀、助攻、死亡都>=10）
     */
    checkTripleDouble(player) {
        return player.kills >= 10 && player.assists >= 10 && player.deaths >= 10;
    }

    /**
     * 检测超神杀戮（连杀≥10）
     * kill_streaks是对象，键为连杀数，值为次数
     * 例如: { "3": 1, "10": 1, "20": 1 } 表示达到过3、10、20连杀
     */
    checkGodlike(player) {
        if (!player.kill_streaks) return false;

        // 检查是否有≥10的连杀记录
        return Object.keys(player.kill_streaks).some(streak =>
            parseInt(streak) >= 10
        );
    }

    /**
     * 检测Carry全场（获胜且击杀超过全队1/2）
     */
    checkCarryGame(player, matchData) {
        const won = (matchData.radiant_win && player.team === 'radiant') ||
            (!matchData.radiant_win && player.team === 'dire');
        if (!won) return false;

        const teamKills = this.getTeamKills(matchData, player.team);
        return player.kills > teamKills / 2;
    }

    /**
     * 检测完美演出（获胜且0死亡）
     */
    checkPerfectGame(player, matchData) {
        const won = (matchData.radiant_win && player.team === 'radiant') ||
            (!matchData.radiant_win && player.team === 'dire');
        return won && player.deaths === 0;
    }

    /**
     * 检测队伍成就：摧毁不朽之守护且获胜
     * 检查获胜队伍是否摧毁了不朽之守护（拒绝了圣物）
     * 只要获胜队伍有任意一次摧毁盾，就算达成成就
     */
    checkAegisVictory(matchData) {
        if (!matchData.objectives) return false;

        // 查找所有 CHAT_MESSAGE_DENIED_AEGIS 事件（摧毁不朽之守护）
        const deniedAegisEvents = matchData.objectives.filter(obj =>
            obj.type === 'CHAT_MESSAGE_DENIED_AEGIS'
        );

        if (deniedAegisEvents.length === 0) return false;

        // 获胜队伍
        const winningTeam = matchData.radiant_win ? 'radiant' : 'dire';

        // 检查是否有任意一次摧毁盾的事件是获胜队伍完成的
        return deniedAegisEvents.some(event => {
            // player_slot < 128 为天辉（Radiant），>= 128 为夜魇（Dire）
            const playerTeam = event.player_slot < 128 ? 'radiant' : 'dire';
            return playerTeam === winningTeam;
        });
    }

    /**
     * 获取队伍总击杀数
     */
    getTeamKills(matchData, team) {
        return matchData.players
            .filter(p => p.team === team)
            .reduce((sum, p) => sum + p.kills, 0);
    }

    /**
     * 检测隐藏成就：乐邦詹士
     * 条件：在失败的比赛中，最后7秒完成2次击杀
     * 特殊性：每届比赛只有第一个完成的人才能获得
     * @param {Object} matchData - 比赛数据
     * @param {number} leagueId - 联赛ID
     * @returns {Promise<Array>} 符合条件的玩家列表
     */
    async checkLeBronJames(matchData, leagueId) {
        // 1. 检查是否有 kills_log 数据
        const hasKillsLog = matchData.players.some(p => p.kills_log && p.kills_log.length > 0);
        if (!hasKillsLog) {
            return []; // 无法检测，返回空数组
        }

        // 2. 检查该联赛是否已有人获得此成就
        const existingAchievement = await Achievement.findOne({
            where: {
                achievement_type: 'lebron_james',
                is_unique: true,
                league_id: leagueId
            },
            include: [{
                model: Match,
                attributes: ['match_id', 'start_time']
            }],
            order: [['created_at', 'ASC']] // 按创建时间排序，获取第一个创建的
        });

        if (existingAchievement) {
            // 比较比赛时间，而不是创建时间
            const existingMatchId = existingAchievement.match_id;
            const currentMatchId = matchData.match_id;

            // match_id 越小，比赛越早（Dota 2 的 match_id 是递增的）
            if (currentMatchId >= existingMatchId) {
                // 当前比赛更晚或相同，不授予成就
                console.log(`⚠️  "乐邦詹士"成就已被玩家 ${existingAchievement.player_id} 在比赛 ${existingMatchId} 中获得`);
                console.log(`   当前比赛 ${currentMatchId} 更晚，不授予成就`);
                return [];
            } else {
                // 当前比赛更早！这说明同步顺序有问题，需要修正
                console.log(`🔄 发现更早的成就完成者！`);
                console.log(`   旧成就: 比赛 ${existingMatchId}, 玩家 ${existingAchievement.player_id}`);
                console.log(`   新成就: 比赛 ${currentMatchId} (更早)`);
                console.log(`   删除旧成就，准备授予新成就...`);

                // 删除旧成就
                await Achievement.destroy({
                    where: { id: existingAchievement.id }
                });

                console.log(`   ✅ 已删除旧成就，继续检测当前比赛...`);
                // 继续检测当前比赛
            }
        }

        // 3. 计算最后7秒的时间阈值
        const lastSevenSeconds = matchData.duration - 7;
        const candidates = [];

        // 4. 遍历所有玩家
        for (const player of matchData.players) {
            // 检查是否失败
            const won = (matchData.radiant_win && player.player_slot < 128) ||
                (!matchData.radiant_win && player.player_slot >= 128);

            if (won) continue; // 只检测失败的玩家

            // 检查最后7秒的击杀数
            if (player.kills_log && player.kills_log.length > 0) {
                const killsInLastSeven = player.kills_log.filter(
                    k => k.time >= lastSevenSeconds
                );

                if (killsInLastSeven.length >= 2) {
                    candidates.push({
                        player_id: player.account_id,
                        player_slot: player.player_slot,
                        kills_count: killsInLastSeven.length,
                        kills_detail: killsInLastSeven
                    });
                }
            }
        }

        // 5. 如果有多个候选人，选择第一个（按 player_slot 排序）
        if (candidates.length > 0) {
            candidates.sort((a, b) => a.player_slot - b.player_slot);
            console.log(`🏀 发现 ${candidates.length} 位玩家达成"乐邦詹士"条件，选择第一位: Slot ${candidates[0].player_slot}`);
            return [candidates[0]]; // 只返回第一个
        }

        return [];
    }
}

module.exports = new AchievementService();

