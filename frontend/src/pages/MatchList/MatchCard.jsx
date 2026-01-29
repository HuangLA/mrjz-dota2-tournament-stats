import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTime, formatDuration } from '../../utils/format';
import { getHeroAvatarUrl } from '../../utils/heroUtils';
import './MatchList.css';

const MatchCard = ({ match }) => {
    const navigate = useNavigate();

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(/\//g, '-');
    };

    const radiantHeroes = match.players?.filter(p => p.team === 'radiant').map(p => p.hero_id) || [];
    const direHeroes = match.players?.filter(p => p.team === 'dire').map(p => p.hero_id) || [];

    const handleCardClick = () => {
        navigate(`/matches/${match.match_id}`);
    };

    return (
        <div className="match-card" onClick={handleCardClick}>
            {/* Row 1: ID, Time, Result Badge */}
            <div className="mc-header">
                <div className="mc-meta">
                    <span className="mc-id">{match.match_id}</span>
                    <span className="mc-time">{formatDate(match.start_time)}</span>
                </div>
                <div className={`mc-result-badge ${match.radiant_win ? 'radiant' : 'dire'}`}>
                    {match.radiant_win ? '天辉获胜' : '夜魇获胜'}
                </div>
            </div>

            {/* Row 2: Teams & Score */}
            <div className="mc-teams-row">
                <div className="mc-team radiant">
                    {match.radiant_team_name || '天辉'}
                </div>
                <div className="mc-score">
                    <span className="radiant-score">{match.radiant_score}</span>
                    <span className="vs">:</span>
                    <span className="dire-score">{match.dire_score}</span>
                </div>
                <div className="mc-team dire">
                    {match.dire_team_name || '夜魇'}
                </div>
            </div>

            {/* Row 3: Heroes */}
            <div className="mc-heroes-row">
                <div className="mc-heroes radiant">
                    {radiantHeroes.map((heroId, idx) => (
                        <img
                            key={`r-${idx}`}
                            src={getHeroAvatarUrl(heroId)}
                            className="mc-hero-icon"
                            alt=""
                        />
                    ))}
                </div>
                <div className="mc-vscode">VS</div>
                <div className="mc-heroes dire">
                    {direHeroes.map((heroId, idx) => (
                        <img
                            key={`d-${idx}`}
                            src={getHeroAvatarUrl(heroId)}
                            className="mc-hero-icon"
                            alt=""
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MatchCard;
