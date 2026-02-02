import React from 'react';
import CrownIcon from '../../../components/CrownIcon';

const ACHIEVEMENT_INFO = {
    rampage: { name: '暴虐成狂', icon: '🏆', description: '完成暴走' },
    first_blood: { name: '旗开得胜', icon: '🩸', description: '首杀' },
    aegis_snatch: { name: '虎口夺食', icon: '🛡️', description: '夺取不朽之守护' },
    triple_double: { name: '你也是威少粉丝', icon: '📊', description: '完成三双' },
    godlike: { name: '位列仙班', icon: '⚡', description: '完成超神杀戮' },
    carry_game: { name: '对不起这把比赛我要赢', icon: '💪', description: '获胜且击杀超过全队1/2' },
    perfect_game: { name: '完美演出', icon: '✨', description: '获胜且0死亡' },
    team_achievement: { name: '队伍成就', icon: '🏅', description: '队伍成就' },
    lebron_james: {
        name: '乐邦詹士',
        icon: 'crown', // 特殊标记，使用王冠图标
        description: '在失败的比赛中，最后5秒完成2次击杀',
        isHidden: true // 标记为隐藏成就
    }
};

const AchievementList = ({ achievements }) => {
    if (!achievements || achievements.length === 0) {
        return null;
    }

    // 分离普通成就和隐藏成就
    const normalAchievements = achievements.filter(a => !ACHIEVEMENT_INFO[a.achievement_type]?.isHidden);
    const hiddenAchievements = achievements.filter(a => ACHIEVEMENT_INFO[a.achievement_type]?.isHidden);

    return (
        <div className="achievement-section">
            <h2 className="achievement-title">🏆 比赛成就</h2>

            {/* 普通成就 */}
            {normalAchievements.length > 0 && (
                <div className="achievement-list">
                    {normalAchievements.map((achievement, index) => {
                        const info = ACHIEVEMENT_INFO[achievement.achievement_type] || {
                            name: achievement.achievement_type,
                            icon: '🎯',
                            description: ''
                        };

                        return (
                            <div key={index} className="achievement-item">
                                <span className="achievement-icon">{info.icon}</span>
                                <div className="achievement-content">
                                    <div className="achievement-name">{info.name}</div>
                                    {achievement.Player && (
                                        <div className="achievement-player">
                                            {achievement.Player.avatar_url && (
                                                <img
                                                    src={achievement.Player.avatar_url}
                                                    alt={achievement.Player.nickname}
                                                    className="achievement-player-avatar"
                                                />
                                            )}
                                            <span className="achievement-player-name">
                                                {achievement.Player.nickname}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 隐藏成就 - 特殊显示 */}
            {hiddenAchievements.length > 0 && (
                <div className="hidden-achievement-section">
                    <h3 className="hidden-achievement-title">
                        <span className="hidden-achievement-badge">隐藏成就</span>
                    </h3>
                    <div className="achievement-list">
                        {hiddenAchievements.map((achievement, index) => {
                            const info = ACHIEVEMENT_INFO[achievement.achievement_type];

                            return (
                                <div key={index} className="achievement-item hidden-achievement-item">
                                    {/* 使用王冠图标 */}
                                    <div className="achievement-icon-wrapper">
                                        <CrownIcon size={32} />
                                    </div>
                                    <div className="achievement-content">
                                        <div className="achievement-name hidden-achievement-name">
                                            {info.name}
                                        </div>
                                        {/* 隐藏的描述，hover时显示 */}
                                        <div className="achievement-description-tooltip">
                                            {info.description}
                                        </div>
                                        {achievement.Player && (
                                            <div className="achievement-player">
                                                {achievement.Player.avatar_url && (
                                                    <img
                                                        src={achievement.Player.avatar_url}
                                                        alt={achievement.Player.nickname}
                                                        className="achievement-player-avatar"
                                                    />
                                                )}
                                                <span className="achievement-player-name">
                                                    {achievement.Player.nickname}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementList;
