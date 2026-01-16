import React from 'react';
import PlayerRow from './PlayerRow';

const TeamTable = ({ team, teamName, players, isWinner }) => {
    return (
        <div className={`team-table ${team} ${isWinner ? 'winner' : ''}`}>
            <div className="team-table-header">
                <h2 className={`team-title ${team}`}>
                    {teamName}
                    {isWinner && <span className="winner-badge">获胜</span>}
                </h2>
            </div>

            <div className="team-table-content">
                <div className="table-header-row">
                    <div className="col-hero">英雄</div>
                    <div className="col-player">选手</div>
                    <div className="col-kda">K/D/A</div>
                    <div className="col-lhd">LH/D</div>
                    <div className="col-nw">净值</div>
                    <div className="col-gpm">GPM</div>
                    <div className="col-xpm">XPM</div>
                    <div className="col-damage">伤害</div>
                    <div className="col-items">装备</div>
                </div>

                {players.map((player, index) => (
                    <PlayerRow
                        key={index}
                        player={player}
                        team={team}
                    />
                ))}
            </div>
        </div>
    );
};

export default TeamTable;
