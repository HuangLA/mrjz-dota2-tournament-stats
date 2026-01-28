import React from 'react';
import PlayerRow from './PlayerRow';

const TeamTable = ({ team, teamName, players, isWinner, matchId }) => {
    const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'desc' });

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedPlayers = React.useMemo(() => {
        let sortablePlayers = [...players];
        if (sortConfig.key) {
            sortablePlayers.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // 特殊字段处理
                if (sortConfig.key === 'kda') {
                    const getKdaRatio = (p) => (p.kills + p.assists) / (p.deaths || 1);
                    aValue = getKdaRatio(a);
                    bValue = getKdaRatio(b);
                } else if (sortConfig.key === 'player_name') {
                    aValue = a.Player?.nickname || '';
                    bValue = b.Player?.nickname || '';
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortablePlayers;
    }, [players, sortConfig]);

    const HeaderCell = ({ label, columnKey, className }) => (
        <div
            className={`${className} ${sortConfig.key === columnKey ? 'sorted' : ''} sortable`}
            onClick={() => requestSort(columnKey)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
        >
            {label}
            {sortConfig.key === columnKey && (
                <span className="sort-indicator">{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
            )}
        </div>
    );

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
                    <HeaderCell label="选手" columnKey="player_name" className="col-player" />
                    <HeaderCell label="K/D/A" columnKey="kda" className="col-kda" />
                    <HeaderCell label="LH/D" columnKey="last_hits" className="col-lhd" />
                    <HeaderCell label="财产总和" columnKey="net_worth" className="col-nw" />
                    <HeaderCell label="GPM" columnKey="gpm" className="col-gpm" />
                    <HeaderCell label="XPM" columnKey="xpm" className="col-xpm" />
                    <HeaderCell label="建筑伤害" columnKey="tower_damage" className="col-damage" />
                    <HeaderCell label="英雄伤害" columnKey="hero_damage" className="col-damage" />
                    <HeaderCell label="承受伤害" columnKey="damage_taken" className="col-damage" />
                    <div className="col-items">装备</div>
                </div>

                {sortedPlayers.map((player, index) => (
                    <PlayerRow
                        key={index}
                        player={player}
                        team={team}
                        matchId={matchId}
                    />
                ))}
            </div>
        </div>
    );
};

export default TeamTable;
