import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { getHeroIconUrl } from '../../utils/heroUtils';
import './PlayerList.css'; // Reuse styles or add specific ones

const PlayerCard = ({ player, pagination }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = (e) => {
        // Prevent expanding when clicking links
        if (e.target.closest('a') || e.target.closest('.no-expand')) return;
        setIsExpanded(!isExpanded);
    };

    const formatNumber = (num, decimals = 1) => {
        if (num === null || num === undefined) return '-';
        return Number(num).toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const formatInt = (num) => {
        if (num === null || num === undefined) return '-';
        return Number(num).toLocaleString();
    };

    return (
        <div className={`player-card ${isExpanded ? 'expanded' : ''}`} onClick={toggleExpand}>
            {/* Card Header: Avatar | Name+Team | WinRate+KDA */}
            <div className="card-header">
                <div className="player-identity">
                    <img
                        src={player.avatar_url || 'https://www.dota2.com.cn/images/heroes/face/antimage.jpg'}
                        alt={player.nickname}
                        className="card-avatar"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/players/${player.player_id}`);
                        }}
                    />
                    <div className="identity-info">
                        <div className="card-nickname" onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/players/${player.player_id}`);
                        }}>
                            {player.nickname || `Player ${player.player_id}`}
                        </div>
                        {player.team_name && (
                            <div className="card-team">{player.team_name}</div>
                        )}
                    </div>
                </div>

                <div className="card-primary-stats">
                    <div className="stat-group">
                        <div className="win-rate-bar-container">
                            <div className="win-rate-text">{formatNumber(player.win_rate)}% 胜率</div>
                            <div className="progress-bg">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${Math.min(player.win_rate || 0, 100)}%`,
                                        backgroundColor: parseFloat(player.win_rate) >= 50 ? '#33dba8' : '#ff3a48'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="stat-group kda-group">
                        <div className="stat-value highlight">{formatNumber(player.kda_ratio, 2)}</div>
                        <div className="stat-label">KDA</div>
                    </div>
                    <div className="expand-icon">
                        {isExpanded ? <CaretUpOutlined /> : <CaretDownOutlined />}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="card-body">
                    <div className="stats-grid-mobile">
                        <div className="m-stat-item">
                            <span className="label">场次</span>
                            <span className="value">{formatInt(player.matches_count)}</span>
                        </div>
                        <div className="m-stat-item">
                            <span className="label">GPM</span>
                            <span className="value">{formatNumber(player.avg_gpm, 0)}</span>
                        </div>
                        <div className="m-stat-item">
                            <span className="label">XPM</span>
                            <span className="value">{formatNumber(player.avg_xpm, 0)}</span>
                        </div>
                        <div className="m-stat-item">
                            <span className="label">场均击杀</span>
                            <span className="value">{formatNumber(player.avg_kills)}</span>
                        </div>
                        <div className="m-stat-item">
                            <span className="label">场均死亡</span>
                            <span className="value">{formatNumber(player.avg_deaths)}</span>
                        </div>
                        <div className="m-stat-item">
                            <span className="label">场均助攻</span>
                            <span className="value">{formatNumber(player.avg_assists)}</span>
                        </div>
                        <div className="m-stat-item">
                            <span className="label">承伤</span>
                            <span className="value">{formatNumber(player.avg_damage_taken, 0)}</span>
                        </div>
                        <div className="m-stat-item">
                            <span className="label">场均财产</span>
                            <span className="value">{formatNumber(player.avg_net_worth, 0)}</span>
                        </div>
                        <div className="m-stat-item">
                            <span className="label">英雄伤害</span>
                            <span className="value">{formatNumber(player.avg_hero_damage, 0)}</span>
                        </div>
                        <div className="m-stat-item">
                            <span className="label">建筑伤害</span>
                            <span className="value">{formatNumber(player.avg_tower_damage, 0)}</span>
                        </div>
                    </div>

                    {/* Signature Heroes */}
                    {player.signature_heroes && player.signature_heroes.length > 0 && (
                        <div className="card-heroes">
                            <div className="heroes-label">擅长:</div>
                            <div className="heroes-list">
                                {player.signature_heroes.slice(0, 3).map(heroId => (
                                    <img
                                        key={heroId}
                                        src={getHeroIconUrl(heroId)}
                                        alt={`Hero ${heroId}`}
                                        className="card-hero-icon"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlayerCard;
