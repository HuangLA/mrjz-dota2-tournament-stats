const { Achievement } = require('../models');

class AchievementService {
    /**
     * 检测并保存比赛的所有成就
     * @param {Object} matchData - 比赛数据
     * @returns {Promise<Array>} 保存的成就列表
     */
    async detectAndSaveAchievements(matchData) {
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

        // 3. 批量保存成就
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
     */
    checkAegisVictory(matchData) {
        // 这个需要从比赛数据的 objectives 字段获取
        // 简化版本：检查获胜队伍是否有人拿过盾
        return matchData.aegis_destroyed_by_winner === true;
    }

    /**
     * 获取队伍总击杀数
     */
    getTeamKills(matchData, team) {
        return matchData.players
            .filter(p => p.team === team)
            .reduce((sum, p) => sum + p.kills, 0);
    }
}

module.exports = new AchievementService();

