import React from 'react';
import { formatTime, formatDuration } from '../../../utils/format';
import { GAME_MODES } from '../../../utils/constants';

const MatchHeader = ({ match }) => {
    const matchTime = formatTime(match.start_time);
    const duration = formatDuration(match.duration);
    const gameMode = GAME_MODES[match.game_mode] || `模式 ${match.game_mode}`;

    return (
        <div className="match-header">
            <div className="match-header-top">
                <div className="match-info">
                    <h1>比赛 #{match.match_id}</h1>
                    <div className="match-meta">
                        <span className="match-time">{matchTime}</span>
                        <span className="match-duration">时长: {duration}</span>
                        <span className="match-mode">{gameMode}</span>
                    </div>
                </div>
            </div>

            <div className="match-header-teams">
                <div className={`team-info radiant ${match.radiant_win ? 'winner' : ''}`}>
                    <div className="team-name">{match.radiant_team_name || '天辉'}</div>
                    {match.radiant_win && <div className="winner-badge">胜利</div>}
                </div>

                <div className="match-score">
                    <span className="score radiant">{match.radiant_score}</span>
                    <span className="separator">:</span>
                    <span className="score dire">{match.dire_score}</span>
                </div>

                <div className={`team-info dire ${!match.radiant_win ? 'winner' : ''}`}>
                    <div className="team-name">{match.dire_team_name || '夜魇'}</div>
                    {!match.radiant_win && <div className="winner-badge">胜利</div>}
                </div>
            </div>
        </div>
    );
};

export default MatchHeader;
