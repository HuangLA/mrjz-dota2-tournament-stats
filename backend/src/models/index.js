const { sequelize } = require('../config/database');

// 导入所有模型
const Match = require('./Match');
const Player = require('./Player');
const MatchPlayer = require('./MatchPlayer');
const Hero = require('./Hero');
const Achievement = require('./Achievement');
const ApiKey = require('./ApiKey');
const SyncLog = require('./SyncLog');

// 定义模型关联
// Match 和 MatchPlayer
Match.hasMany(MatchPlayer, { foreignKey: 'match_id', as: 'players' });
MatchPlayer.belongsTo(Match, { foreignKey: 'match_id' });

// Player 和 MatchPlayer
Player.hasMany(MatchPlayer, { foreignKey: 'player_id', as: 'matches' });
MatchPlayer.belongsTo(Player, { foreignKey: 'player_id' });

// Hero 和 MatchPlayer
Hero.hasMany(MatchPlayer, { foreignKey: 'hero_id' });
MatchPlayer.belongsTo(Hero, { foreignKey: 'hero_id' });

// Match 和 Achievement
Match.hasMany(Achievement, { foreignKey: 'match_id', as: 'achievements' });
Achievement.belongsTo(Match, { foreignKey: 'match_id' });

// Player 和 Achievement
Player.hasMany(Achievement, { foreignKey: 'player_id', as: 'achievements' });
Achievement.belongsTo(Player, { foreignKey: 'player_id' });

// 初始化模型函数
async function initModels() {
    console.log('✅ Models initialized');
    return true;
}

// 导出所有模型
module.exports = {
    sequelize,
    Match,
    Player,
    MatchPlayer,
    Hero,
    Achievement,
    ApiKey,
    SyncLog,
    initModels
};
