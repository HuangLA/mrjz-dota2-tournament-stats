import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Select } from 'antd';
import { getPlayers } from '../../api/players';
import { getHeroIconUrl } from '../../utils/heroUtils';
import NoData from '../../components/common/NoData';
import PlayerCard from './PlayerCard';
import './PlayerList.css';

const { Option } = Select;

const PlayerList = () => {
    const [players, setPlayers] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(18365); // 默认第二届
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 1
    });

    // 排序状态（前端排序作为补充，如果需要后端排序可以传参给API）
    // 目前后端已按场次排序，这里主要是在当前页排序
    const [sortConfig, setSortConfig] = useState({ key: 'matches_count', direction: 'desc' });

    useEffect(() => {
        fetchPlayers();
    }, [pagination.page, selectedLeague]);

    const fetchPlayers = async () => {
        try {
            setLoading(true);
            const data = await getPlayers({
                page: pagination.page,
                limit: pagination.limit,
                league_id: selectedLeague
            });

            if (data.success) {
                setPlayers(data.data);
                // FIX: Backend returns 'pagination', not 'meta'
                const meta = data.pagination || data.meta || {};
                setPagination(prev => ({
                    ...prev,
                    total: meta.total || 0,
                    totalPages: meta.totalPages || 1
                }));
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedPlayers = React.useMemo(() => {
        if (!players) return [];
        let sorted = [...players];
        if (sortConfig.key) {
            sorted.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // 处理可能是字符串的数字
                if (!isNaN(parseFloat(aValue)) && isFinite(aValue)) {
                    aValue = parseFloat(aValue);
                    bValue = parseFloat(bValue);
                }

                // 处理昵称
                if (sortConfig.key === 'nickname') {
                    aValue = a.nickname || '';
                    bValue = b.nickname || '';
                    return sortConfig.direction === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sorted;
    }, [players, sortConfig]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleLeagueChange = (value) => {
        setSelectedLeague(value);
        setPagination(prev => ({ ...prev, page: 1 })); // switch league resets to page 1
    };

    // Media Query for Mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (loading && players.length === 0) {
        return (
            <div className="player-list-container">
                <div className="loading-container">
                    <div className="loading-dots">加载中...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="player-list-container">
                <div className="error-container">
                    <h2>加载失败</h2>
                    <p>{error}</p>
                    <button onClick={fetchPlayers} className="pagination-btn">重试</button>
                </div>
            </div>
        );
    }

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

    const columns = [
        {
            key: 'nickname', label: '选手', render: (p) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="player-info">
                        <Link
                            to={`/players/${p.player_id}`}
                            state={{ from: '/players', label: '返回选手列表' }}
                            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <img
                                src={p.avatar_url || 'https://www.dota2.com.cn/images/heroes/face/antimage.jpg'}
                                alt={p.nickname}
                                className="player-avatar-small"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.dota2.com.cn/images/heroes/face/antimage.jpg'; }}
                            />
                            <span className="player-name name-link">{p.nickname || `Player ${p.player_id}`}</span>
                        </Link>
                    </div>
                    {p.team_name && (
                        <span className="team-badge" title={`所属战队: ${p.team_name}`}>
                            {p.team_name}
                        </span>
                    )}
                </div>
            ),
        },
        // 新增 擅长英雄
        {
            key: 'signature_heroes', label: '擅长英雄', render: (p) => (
                <div style={{ display: 'flex', gap: '4px' }}>
                    {p.signature_heroes && p.signature_heroes.slice(0, 3).map(heroId => (
                        <img
                            key={heroId}
                            src={getHeroIconUrl(heroId)}
                            alt={`Hero ${heroId}`}
                            title={`Hero ID: ${heroId}`}
                            style={{ width: '32px', height: '18px', objectFit: 'cover', borderRadius: '2px', backgroundColor: '#000' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ))}
                    {(!p.signature_heroes || p.signature_heroes.length === 0) && <span style={{ color: '#666' }}>-</span>}
                </div>
            )
        },
        { key: 'matches_count', label: '场次', align: 'center', render: (p) => formatInt(p.matches_count) },
        { key: 'win_rate', label: '胜率', render: (p) => `${formatNumber(p.win_rate)}%` },
        { key: 'kda_ratio', label: 'KDA', render: (p) => formatNumber(p.kda_ratio, 2) },
        { key: 'avg_kills', label: '场均击杀' },
        { key: 'avg_deaths', label: '场均死亡' },
        { key: 'avg_assists', label: '场均助攻' },
        { key: 'avg_gpm', label: 'GPM', render: (p) => formatNumber(p.avg_gpm, 2) },
        { key: 'avg_xpm', label: 'XPM', render: (p) => formatNumber(p.avg_xpm, 2) },
        { key: 'avg_net_worth', label: '场均财产', render: (p) => formatNumber(p.avg_net_worth, 0) },
        { key: 'avg_hero_damage', label: '英雄伤害', render: (p) => formatNumber(p.avg_hero_damage, 0) },
        { key: 'avg_tower_damage', label: '建筑伤害', render: (p) => formatNumber(p.avg_tower_damage, 0) }, // Use 0 decimals for damage
        { key: 'avg_damage_taken', label: '场均承伤', render: (p) => formatNumber(p.avg_damage_taken, 0) }
    ];

    const SortIcon = ({ colKey }) => {
        if (sortConfig.key !== colKey) return null;
        return <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="player-list-container">
            <div className="page-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                flexDirection: 'row', // Always row to keep controls in top-right
            }}>
                <div>
                    <h1>选手统计</h1>
                    <div className="page-subtitle">选手数据汇总</div>
                </div>
                <div className="header-controls" style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: isMobile ? 'flex-start' : 'center', // Left align controls with each other
                    flexDirection: isMobile ? 'column' : 'row', // Stack vertically
                }}>
                    <Select
                        value={selectedLeague}
                        onChange={handleLeagueChange}
                        style={{ width: isMobile ? 125 : 180 }}
                        size={isMobile ? 'middle' : 'large'}
                        placeholder="选择联赛"
                    >
                        <Option value={null}>全部联赛</Option>
                        <Option value={18365}>第二届 (18365)</Option>
                        <Option value={17485}>第一届 (17485)</Option>
                    </Select>

                    {isMobile && (
                        <div style={{ display: 'flex', gap: '8px', width: 'auto' }}>
                            <Select
                                value={sortConfig.key}
                                onChange={(val) => setSortConfig(prev => ({ ...prev, key: val }))}
                                style={{ width: 125 }}
                                size="middle"
                                placeholder="排序方式"
                            >
                                <Option value="matches_count">场次</Option>
                                <Option value="win_rate">胜率</Option>
                                <Option value="kda_ratio">KDA</Option>
                                <Option value="avg_kills">场均击杀</Option>
                                <Option value="avg_deaths">场均死亡</Option>
                                <Option value="avg_assists">场均助攻</Option>
                                <Option value="avg_gpm">GPM</Option>
                                <Option value="avg_xpm">XPM</Option>
                                <Option value="avg_net_worth">场均财产</Option>
                                <Option value="avg_hero_damage">英雄伤害</Option>
                                <Option value="avg_tower_damage">建筑伤害</Option>
                                <Option value="avg_damage_taken">场均承伤</Option>
                            </Select>
                            <button
                                onClick={() => handleSort(sortConfig.key)}
                                className="pagination-btn"
                                style={{ padding: '4px 12px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isMobile ? (
                // Mobile Card View
                <div className="players-card-grid">
                    {sortedPlayers.length > 0 ? (
                        sortedPlayers.map((player) => (
                            <PlayerCard key={player.player_id} player={player} />
                        ))
                    ) : (
                        <NoData message="暂无选手数据" />
                    )}
                </div>
            ) : (
                // Desktop Table View
                <div className="players-table-container">
                    <table className="players-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('row_number')} style={{ width: '60px' }}>#</th>
                                {columns.map(col => (
                                    <th
                                        key={col.key}
                                        onClick={() => handleSort(col.key)}
                                        className={sortConfig.key === col.key ? 'sorted' : ''}
                                        style={{ textAlign: col.align || 'left' }}
                                    >
                                        {col.label}
                                        <SortIcon colKey={col.key} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPlayers.length > 0 ? (
                                sortedPlayers.map((player, index) => (
                                    <tr key={player.player_id}>
                                        <td className="stat-cell">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                        {columns.map(col => (
                                            <td key={col.key} className={`stat-cell ${col.key === 'nickname' ? '' : ''}`} style={{ textAlign: col.align || 'left' }}>
                                                {col.render ? col.render(player) : formatNumber(player[col.key], 1)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 1} style={{ padding: 0 }}>
                                        <NoData message="暂无选手数据" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div className="pagination">
                <button
                    className="pagination-btn"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                >
                    上一页
                </button>
                <span className="pagination-info">
                    第 {pagination.page} 页 / 共 {pagination.totalPages} 页
                </span>
                <button
                    className="pagination-btn"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                >
                    下一页
                </button>
            </div>
        </div>
    );
};

export default PlayerList;
