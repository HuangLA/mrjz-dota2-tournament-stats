import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Spin, Button, message, Table } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined } from '@ant-design/icons';
import { getPlayerStats, getPlayerMatches } from '../../api/players';
import { getHeroIconUrl } from '../../utils/heroUtils';
import './PlayerDetail.css';

const PlayerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    // Smart Navigation State
    const backPath = location.state?.from || '/players';
    const backLabel = location.state?.label || '返回选手列表';
    const [playerData, setPlayerData] = useState(null);
    const [matches, setMatches] = useState([]);
    const [matchLoading, setMatchLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0
    });

    useEffect(() => {
        loadData();
    }, [id]);

    useEffect(() => {
        loadMatches();
    }, [id, pagination.page]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getPlayerStats(id);
            if (res.success) {
                setPlayerData(res.data);
            }
        } catch (error) {
            console.error(error);
            message.error('加载选手数据失败');
        } finally {
            setLoading(false);
        }
    };

    const loadMatches = async () => {
        try {
            setMatchLoading(true);
            const res = await getPlayerMatches(id, {
                page: pagination.page,
                limit: pagination.limit
            });
            if (res.success || res.data) {
                // Handle different response structures gracefully
                const list = res.data || res.rows || [];
                const total = res.pagination?.total || res.count || 0;
                setMatches(list);
                setPagination(prev => ({ ...prev, total }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setMatchLoading(false);
        }
    };

    const formatNumber = (num, decimals = 1) => {
        if (num === null || num === undefined) return '-';
        return Number(num).toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    if (loading) {
        return (
            <div className="player-detail-container">
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (!playerData) {
        return (
            <div className="player-detail-container">
                <div className="glass-card">
                    <h2>选手不存在</h2>
                    <Button onClick={() => navigate('/players')}>返回列表</Button>
                </div>
            </div>
        );
    }

    const { player, matchStats, signatureHeroes } = playerData;

    // Check if user has team (from last match or DB if available)
    // For now we might not have 'team_name' in 'player' object unless backend sends it.
    // Assuming backend 'player' object is plain. We might rely on stats or matches to find team name.

    // Calculate Win Rate
    const winRate = matchStats.total_games > 0
        ? ((playerData.signatureHeroes?.reduce((acc, h) => acc + parseInt(h.wins), 0) / playerData.signatureHeroes?.reduce((acc, h) => acc + parseInt(h.matches_count), 0)) * 100)
        // Wait, matchStats usually has win count? No, in getPlayerStats we removed it from simple stats... 
        // Let's use the one from api
        : 0;

    // Actually, matchStats in controller didn't aggregate wins for the whole player, just Avg KDA etc.
    // We can estimate or fetch from list logic. 
    // OR we can rely on `signatureHeroes` sum? No, that's top 3.
    // Let's check `matchStats` structure again.
    // in controller: `matchStats` has avg_kills, etc. No wins count.
    // We might need to rely on what we have or update backend. 
    // BUT! `signatureHeroes` has wins/matches for top heroes. 
    // For general winrate, we can calc from matches list or request backend update.
    // Since we didn't update backend for `total_wins`, let's just show stats we have and maybe skip overall winrate if not available, OR calc from match history (incomplete).
    // Wait, `getPlayers` (list) has winrate. `getPlayerStats` does not. 
    // Let's just use what we have. KDA IS available.

    const kda = ((parseFloat(matchStats.avg_kills) + parseFloat(matchStats.avg_assists)) / parseFloat(matchStats.avg_deaths || 1)).toFixed(2);

    const columns = [
        {
            title: '英雄',
            dataIndex: 'hero_id',
            key: 'hero',
            render: (heroId) => (
                <img
                    src={getHeroIconUrl(heroId)}
                    style={{ width: 48, height: 27, borderRadius: 2 }}
                    alt=""
                />
            )
        },
        {
            title: '比赛ID',
            dataIndex: 'match_id',
            key: 'match_id',
            render: (text) => <a onClick={() => navigate(`/matches/${text}`)}>{text}</a>
        },
        {
            title: '结果',
            key: 'result',
            render: (_, record) => {
                const isRadiant = record.team === 'radiant';
                const radiantWin = record.Match?.radiant_win;
                const isWin = (isRadiant && radiantWin) || (!isRadiant && !radiantWin);
                return <span className={isWin ? 'match-result win' : 'match-result loss'}>{isWin ? '胜利' : '失败'}</span>;
            }
        },
        {
            title: 'K/D/A', // KDA
            key: 'kda',
            render: (_, record) => `${record.kills}/${record.deaths}/${record.assists}`
        },
        {
            title: '伤害',
            dataIndex: 'hero_damage',
            key: 'damage',
            render: (val) => val?.toLocaleString()
        },
        {
            title: '建筑伤害',
            dataIndex: 'tower_damage',
            key: 'tower',
            render: (val) => val?.toLocaleString()
        },
        {
            title: '时间',
            dataIndex: ['Match', 'start_time'],
            key: 'time',
            render: (text) => new Date(text * 1000).toLocaleDateString()
        }
    ];

    return (
        <div className="player-detail-container">
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(backPath)}
                style={{ marginBottom: 16, background: 'transparent', color: '#fff', border: 'none' }}
            >
                {backLabel}
            </Button>

            {/* Header Section */}
            <div className="glass-card profile-header">
                <div className="profile-avatar-wrapper">
                    <img
                        src={player.avatar_url || 'https://www.dota2.com.cn/images/heroes/face/antimage.jpg'}
                        alt={player.nickname}
                        className="profile-avatar"
                        onError={(e) => { e.target.src = 'https://www.dota2.com.cn/images/heroes/face/antimage.jpg'; }}
                    />
                </div>

                <div className="profile-info">
                    <div className="profile-name-row">
                        <span className="profile-nickname">{player.nickname || `Player ${player.player_id}`}</span>
                        {player.team_name && <span className="profile-team-badge">{player.team_name}</span>}
                    </div>

                    <div className="profile-stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">总场次</span>
                            <span className="stat-value">{matchStats.total_games}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">KDA</span>
                            <span className="stat-value highlight">{kda}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">场均击杀</span>
                            <span className="stat-value">{formatNumber(matchStats.avg_kills)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">场均GPM</span>
                            <span className="stat-value">{formatNumber(matchStats.avg_gpm, 0)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">场均XPM</span>
                            <span className="stat-value">{formatNumber(matchStats.avg_xpm, 0)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">场均建筑伤害</span>
                            <span className="stat-value highlight">{formatNumber(matchStats.avg_tower_damage, 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Signature Heroes */}
            {signatureHeroes && signatureHeroes.length > 0 && (
                <div className="glass-card signature-heroes-section">
                    <h3 className="section-title"><TrophyOutlined /> 擅长英雄</h3>
                    <div className="heroes-grid">
                        {signatureHeroes.map(h => (
                            <div key={h.hero_id} className="hero-card">
                                <img src={getHeroIconUrl(h.hero_id)} alt="" />
                                <div className="hero-card-stats">
                                    <div>{h.matches_count}场</div>
                                    <div className="win-rate-high">{Math.round((h.wins / h.matches_count) * 100)}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Match History */}
            <div className="glass-card">
                <h3 className="section-title">比赛记录</h3>
                <Table
                    columns={columns}
                    dataSource={matches}
                    rowKey="id"
                    loading={matchLoading}
                    pagination={{
                        current: pagination.page,
                        total: pagination.total,
                        pageSize: pagination.limit,
                        onChange: (page) => setPagination(p => ({ ...p, page })),
                        showSizeChanger: false
                    }}
                    rowClassName="match-row"
                    onRow={(record) => ({
                        onClick: () => navigate(`/matches/${record.match_id}`)
                    })}
                />
            </div>
        </div>
    );
};

export default PlayerDetail;
