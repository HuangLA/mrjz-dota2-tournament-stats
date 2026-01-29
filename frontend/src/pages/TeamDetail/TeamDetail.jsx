import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Table, Spin, message, Select, Tag } from 'antd';
import { TeamOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { getTeamMatches } from '../../api/teams';
import { formatTime, formatDuration } from '../../utils/format';
import { GAME_MODES } from '../../utils/constants';
import './TeamDetail.css';

const { Option } = Select;

const TeamDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const [team, setTeam] = useState(null);
    const [matches, setMatches] = useState([]);
    // const [selectedLeague, setSelectedLeague] = useState(null); // Removed
    const [membersExpanded, setMembersExpanded] = useState(true);
    const [logoError, setLogoError] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        loadTeamData();
    }, [id]); // Removed selectedLeague dependency

    const loadTeamData = async (page = 1, pageSize = 20) => {
        setLoading(true);
        setLogoError(false);
        try {
            // Always pass null for league to get all
            const response = await getTeamMatches(id, page, pageSize, null);
            if (response.success) {
                setTeam(response.data.team);
                setMatches(response.data.matches);
                setPagination({
                    current: response.pagination.page,
                    pageSize: response.pagination.limit,
                    total: response.pagination.total,
                });
            }
        } catch (error) {
            message.error('加载战队数据失败');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Removed handleLeagueChange

    const handleTableChange = (newPagination) => {
        loadTeamData(newPagination.current, newPagination.pageSize);
    };

    const handleMatchClick = (matchId) => {
        navigate(`/matches/${matchId}`);
    };

    const handleLogoError = () => {
        setLogoError(true);
    };

    const columns = [
        {
            title: '比赛 ID',
            dataIndex: 'match_id',
            key: 'match_id',
            width: 120,
            render: (matchId) => (
                <a onClick={() => handleMatchClick(matchId)} style={{ cursor: 'pointer' }}>
                    {matchId}
                </a>
            ),
        },
        {
            title: '时间',
            dataIndex: 'start_time',
            key: 'start_time',
            width: 180,
            render: (time) => formatTime(time),
        },
        {
            title: '对手',
            dataIndex: 'opponent_name',
            key: 'opponent_name',
            width: 150,
        },
        {
            title: '结果',
            dataIndex: 'is_win',
            key: 'is_win',
            width: 80,
            render: (isWin) => (
                <Tag color={isWin ? 'green' : 'red'}>
                    {isWin ? '胜利' : '失败'}
                </Tag>
            ),
        },
        {
            title: '时长',
            dataIndex: 'duration',
            key: 'duration',
            width: 100,
            render: (duration) => formatDuration(duration),
        },
        {
            title: '模式',
            dataIndex: 'game_mode',
            key: 'game_mode',
            width: 120,
            render: (mode) => GAME_MODES[mode] || `模式 ${mode}`,
        },
    ];

    const renderMobileMatchList = () => (
        <div className="mobile-match-list">
            {matches.map(match => (
                <div key={match.match_id} className="mobile-match-card" onClick={() => handleMatchClick(match.match_id)}>
                    <div className="mm-header">
                        <span className="mm-id">ID: {match.match_id}</span>
                        <span className="mm-time">{formatTime(match.start_time)}</span>
                    </div>
                    <div className="mm-body">
                        <div className="mm-opponent">
                            <span className="label">VS</span>
                            <span className="value">{match.opponent_name}</span>
                        </div>
                        <div className={`mm-result ${match.is_win ? 'win' : 'loss'}`}>
                            {match.is_win ? '胜利' : '失败'}
                        </div>
                    </div>
                    <div className="mm-footer">
                        <span className="mm-mode">{GAME_MODES[match.game_mode] || `模式 ${match.game_mode}`}</span>
                        <span className="mm-duration">{formatDuration(match.duration)}</span>
                    </div>
                </div>
            ))}
            {/* Pagination for mobile could be simple Prev/Next buttons or infinite scroll, 
                but for now reusing Antd pagination simplified or just keeping standard pagination below if needed.
                Actually, simpler to just put standard Pagination component below list. */}
            <div className="mobile-pagination" style={{ marginTop: 16, textAlign: 'center' }}>
                {/* Reusing Table pagination logic manually if strict needed, but for now simple page info */}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="team-detail-container">
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="team-detail-container">
                <div className="empty-state">
                    <p>战队不存在</p>
                </div>
            </div>
        );
    }

    const winRateColor = team.win_rate >= 50 ? '#0dc98b' : '#ff3a48';

    return (
        <div className="team-detail-container">
            {/* 战队头部 */}
            <div className="team-detail-header">
                <div className="team-info-section">
                    {team.team_logo_url && !logoError ? (
                        <img
                            src={team.team_logo_url}
                            alt={team.team_name}
                            className="team-logo-large"
                            onError={handleLogoError}
                        />
                    ) : (
                        <div className="team-logo-large-placeholder">
                            <TeamOutlined />
                        </div>
                    )}
                    <div className="team-details">
                        <h1>{team.team_name}</h1>
                        <div className="team-stats-row">
                            <span className="stat-item">{team.total_matches} 场</span>
                            <span className="stat-item">{team.wins} 胜</span>
                            <span className="stat-item">{team.losses} 负</span>
                            <span className="stat-item" style={{ color: winRateColor }}>
                                胜率 {team.win_rate}%
                            </span>
                        </div>
                    </div>
                </div>
                {/* Removed League Select */}
            </div>

            {/* 成员列表 */}
            <div className="members-section">
                <div className="section-header" onClick={() => setMembersExpanded(!membersExpanded)}>
                    <h2>队员列表 ({team.players?.length || 0})</h2>
                    {membersExpanded ? <UpOutlined /> : <DownOutlined />}
                </div>
                {membersExpanded && team.players && team.players.length > 0 && (
                    <div className="members-grid">
                        {team.players.map(player => (
                            <div key={player.player_id} className="member-card">
                                {player.avatar_url ? (
                                    <img src={player.avatar_url} alt={player.nickname} className="member-avatar" />
                                ) : (
                                    <div className="member-avatar-placeholder">?</div>
                                )}
                                <div className="member-info">
                                    <Link
                                        to={`/players/${player.player_id}`}
                                        state={{ from: `/teams/${id}`, label: '返回战队详情' }}
                                        className="member-nickname"
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        {player.nickname}
                                    </Link>
                                    <span className="member-matches">{player.matches_played} 场</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 比赛记录 */}
            <div className="matches-section">
                <h2>比赛记录</h2>
                {isMobile ? (
                    renderMobileMatchList()
                ) : (
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
                            pageSizeOptions: ['10', '20', '50'],
                            onChange: (page, pageSize) => {
                                loadTeamData(page, pageSize);
                            },
                        }}
                        onChange={handleTableChange}
                    />
                )}
            </div>
        </div>
    );
};

export default TeamDetail;
