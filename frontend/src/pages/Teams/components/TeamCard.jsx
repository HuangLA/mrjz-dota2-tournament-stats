import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DownOutlined, UpOutlined, TeamOutlined } from '@ant-design/icons';

const TeamCard = ({ team }) => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const [logoError, setLogoError] = useState(false);

    const handleToggle = () => {
        setExpanded(!expanded);
    };

    const winRateColor = team.win_rate >= 50 ? '#0dc98b' : '#ff3a48';
    const players = team.players || [];

    // 检查玩家昵称是否已同步
    const isPlayerSynced = (nickname) => {
        return nickname && !nickname.startsWith('Player_');
    };

    // 处理 logo 加载失败
    const handleLogoError = () => {
        setLogoError(true);
    };

    // 获取 logo URL（从 radiant 或 dire）
    const getTeamLogoUrl = () => {
        // 假设 team 对象中有 team_logo_url 字段
        return team.team_logo_url || team.radiant_team_logo_url || team.dire_team_logo_url;
    };

    const logoUrl = getTeamLogoUrl();

    return (
        <div className="team-card">
            <div className="team-card-header">
                <div className="team-header-content">
                    {logoUrl && !logoError ? (
                        <img
                            src={logoUrl}
                            alt={team.team_name}
                            className="team-logo"
                            onError={handleLogoError}
                        />
                    ) : (
                        <div className="team-logo-placeholder">
                            <TeamOutlined />
                        </div>
                    )}
                    <div className="team-info">
                        <div
                            className="team-name clickable"
                            onClick={() => navigate(`/teams/${team.team_id}`)}
                        >
                            {team.team_name}
                        </div>
                        <div className="team-stats">
                            <span className="stat-item">
                                {team.total_matches} 场
                            </span>
                            <span className="stat-item">
                                {team.wins} 胜
                            </span>
                            <span className="stat-item" style={{ color: winRateColor }}>
                                胜率 {team.win_rate}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="team-card-footer">
                <button className="toggle-button" onClick={handleToggle}>
                    {expanded ? <UpOutlined /> : <DownOutlined />}
                    <span>队员 ({players.length})</span>
                </button>
            </div>

            {expanded && (
                <div className="team-players">
                    {players.length > 0 ? (
                        <div className="players-list">
                            {players.map(player => {
                                const synced = isPlayerSynced(player.nickname);
                                return (
                                    <div key={player.player_id} className="player-item">
                                        {player.avatar_url && synced && (
                                            <img
                                                src={player.avatar_url}
                                                alt={player.nickname}
                                                className="player-avatar-small"
                                            />
                                        )}
                                        {!synced && (
                                            <div className="player-avatar-placeholder">
                                                <span>?</span>
                                            </div>
                                        )}
                                        <span className={synced ? "player-nickname" : "player-nickname player-nickname-loading"}>
                                            {synced ? (
                                                <Link
                                                    to={`/players/${player.player_id}`}
                                                    state={{ from: '/teams', label: '返回战队列表' }}
                                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                                >
                                                    {player.nickname}
                                                </Link>
                                            ) : (
                                                <>
                                                    加载中<span className="loading-dots"></span>
                                                </>
                                            )}
                                        </span>
                                        <span className="player-matches">
                                            {player.matches_played} 场
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="no-players">暂无队员数据</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeamCard;
