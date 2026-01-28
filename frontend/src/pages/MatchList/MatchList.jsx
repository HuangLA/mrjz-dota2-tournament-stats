import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, message, Tag, Select } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getMatches, getMatchById } from '../../api/matches';
import { triggerSync } from '../../api/sync';
import { formatTime, formatDuration } from '../../utils/format';
import { GAME_MODES } from '../../utils/constants';
import { getHeroIconUrl } from '../../utils/heroMapping';
import SyncProgress from '../../components/SyncProgress';
import NoData from '../../components/common/NoData';
import './MatchList.css';

const { Search } = Input;
const { Option } = Select;

const MatchList = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncVisible, setSyncVisible] = useState(false); // 同步进度显示状态
    const [matches, setMatches] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(18365); // 默认第二届
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    // 加载比赛列表
    const loadMatches = async (page = 1, pageSize = 20) => {
        setLoading(true);
        try {
            const response = await getMatches(page, pageSize, selectedLeague);
            console.log('🔍 API Response:', response);
            console.log('🔍 Pagination from API:', response.pagination);
            if (response.success) {
                // 后端已经包含了 players 数据，无需再次获取详情
                setMatches(response.data);
                console.log('🔍 Setting pagination state:', {
                    current: response.pagination.page,
                    pageSize: response.pagination.limit,
                    total: response.pagination.total,
                });
                setPagination({
                    current: response.pagination.page,
                    pageSize: response.pagination.limit,
                    total: response.pagination.total,
                });
            }
        } catch (error) {
            message.error('加载比赛列表失败');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 搜索比赛
    const handleSearch = (matchId) => {
        if (matchId) {
            navigate(`/matches/${matchId}`);
        }
    };

    // 刷新列表（触发同步）
    const handleRefresh = async () => {
        try {
            setSyncing(true);

            // 触发同步
            await triggerSync(selectedLeague);

            // 显示同步进度
            setSyncVisible(true);
        } catch (error) {
            console.error('Sync error:', error);
            message.error('同步失败，请稍后重试');
            setSyncing(false);
        }
    };

    // 同步完成回调
    const handleSyncComplete = () => {
        setSyncVisible(false);
        setSyncing(false);
        // 刷新比赛列表
        loadMatches(pagination.current, pagination.pageSize);
    };

    // 表格分页变化
    const handleTableChange = (newPagination) => {
        loadMatches(newPagination.current, newPagination.pageSize);
    };

    // 初始加载和联赛变化时重新加载
    useEffect(() => {
        loadMatches();
    }, [selectedLeague]);

    const handleLeagueChange = (value) => {
        setSelectedLeague(value);
        setPagination({ ...pagination, current: 1 }); // 重置到第一页
    };

    // 表格列定义
    const columns = [
        {
            title: '比赛 ID',
            dataIndex: 'match_id',
            key: 'match_id',
            width: 120,
            render: (matchId) => (
                <a onClick={() => navigate(`/matches/${matchId}`)} style={{ fontFamily: 'monospace', fontSize: 13, color: '#dfe5ee' }}>
                    {matchId}
                </a>
            ),
        },
        {
            title: '比赛时间',
            dataIndex: 'start_time',
            key: 'start_time',
            width: 160,
            render: (time) => {
                const formatted = formatTime(time); // "YYYY-MM-DD HH:mm"
                const [date, timePart] = formatted.split(' ');
                return (
                    <div className="match-time-group">
                        <span className="match-date-text">{date}</span>
                        <span className="match-time-text">{timePart}</span>
                    </div>
                );
            },
        },
        {
            title: '持续时间',
            dataIndex: 'duration',
            key: 'duration',
            width: 100,
            render: (duration) => (
                <span style={{ fontSize: 14, fontWeight: 500, color: '#dfe5ee' }}>
                    {formatDuration(duration)}
                </span>
            ),
        },
        {
            title: '比赛结果',
            dataIndex: 'radiant_win',
            key: 'radiant_win',
            width: 160,
            render: (radiantWin) => (
                <div className={`result-badge ${radiantWin ? 'radiant' : 'dire'}`}>
                    {radiantWin ? '天辉获胜' : '夜魇获胜'}
                </div>
            ),
        },
        {
            title: '比分',
            key: 'score',
            width: 100,
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '16px', fontWeight: 700 }}>
                    <span style={{ color: '#0dc98b' }}>{record.radiant_score}</span>
                    <span style={{ color: '#4a4a4a', fontSize: '14px', fontWeight: 400 }}>:</span>
                    <span style={{ color: '#ff3a48' }}>{record.dire_score}</span>
                </div>
            ),
        },
        {
            title: '英雄阵容',
            key: 'lineup',
            width: 500,
            render: (_, record) => {
                const radiantHeroes = record.players?.filter(p => p.team === 'radiant').map(p => p.hero_id) || [];
                const direHeroes = record.players?.filter(p => p.team === 'dire').map(p => p.hero_id) || [];

                // 获取队伍名称，如果没有则使用默认值
                const radiantName = record.radiant_team_name || '天辉';
                const direName = record.dire_team_name || '夜魇';

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* 队伍名称 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="team-name radiant">
                                {radiantName}
                            </div>
                            <span style={{ color: '#3a4149', fontSize: 11, fontWeight: 700 }}>VS</span>
                            <div className="team-name dire">
                                {direName}
                            </div>
                        </div>

                        {/* 英雄头像 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {/* Radiant Heroes */}
                            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                                {radiantHeroes.map((heroId, idx) => (
                                    <div key={idx} style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        background: '#1c222b'
                                    }}>
                                        <img
                                            src={getHeroIconUrl(heroId)}
                                            alt={`Hero ${heroId}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = '/assets/heroes/antimage.png';
                                            }}
                                            title={`Hero ${heroId}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Dire Heroes */}
                            <div style={{ display: 'flex', gap: '4px', flex: 1, justifyContent: 'flex-end' }}>
                                {direHeroes.map((heroId, idx) => (
                                    <div key={idx} style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        background: '#1c222b'
                                    }}>
                                        <img
                                            src={getHeroIconUrl(heroId)}
                                            alt={`Hero ${heroId}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = '/assets/heroes/antimage.png';
                                            }}
                                            title={`Hero ${heroId}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: '游戏模式',
            dataIndex: 'game_mode',
            key: 'game_mode',
            width: 140,
            render: (mode) => (
                <span className="game-mode-text">
                    {GAME_MODES[mode] || `未知模式(${mode})`}
                </span>
            ),
        },
    ];

    return (
        <div className="match-list-container">
            <div className="match-list-header">
                <h1>比赛列表</h1>
                <Space size="middle">
                    <Select
                        value={selectedLeague}
                        onChange={handleLeagueChange}
                        style={{ width: 180 }}
                    >
                        <Option value={null}>全部联赛</Option>
                        <Option value={18365}>第二届 (18365)</Option>
                        <Option value={17485}>第一届 (17485)</Option>
                    </Select>
                    <Search
                        placeholder="输入比赛 ID"
                        allowClear
                        enterButton={<SearchOutlined />}
                        onSearch={handleSearch}
                        style={{ width: 250 }}
                    />
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={syncing}
                        disabled={syncing}
                    >
                        {syncing ? '同步中...' : '刷新'}
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={matches}
                rowKey="match_id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 场比赛`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    onChange: (page, pageSize) => {
                        loadMatches(page, pageSize);
                    },
                    onShowSizeChange: (current, size) => {
                        loadMatches(1, size);
                    }
                }}
                className="match-table"
                onRow={(record) => ({
                    onClick: () => navigate(`/matches/${record.match_id}`),
                    style: { cursor: 'pointer' },
                })}
                locale={{
                    emptyText: <NoData message="暂无比赛数据" />
                }}
            />

            {/* 同步进度组件 */}
            <SyncProgress
                visible={syncVisible}
                onComplete={handleSyncComplete}
            />
        </div>
    );
};

export default MatchList;
