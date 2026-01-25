import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, message, Alert } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { getMatchById, getMatchAchievements, requestParse, refreshMatch } from '../../api/matches';
import MatchHeader from './components/MatchHeader';
import TeamTable from './components/TeamTable';
import AchievementList from './components/AchievementList';
import './MatchDetail.css';
import './items-layout.css';
import './economy-stats.css';
import './column-spacing.css';

const MatchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [refreshCount, setRefreshCount] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isRequestingParse, setIsRequestingParse] = useState(false);

    useEffect(() => {
        loadMatchData();
    }, [id]);

    // 只在有未同步的玩家昵称时才自动刷新
    useEffect(() => {
        if (match && refreshCount === 0) {
            // 检查是否有未同步的玩家（昵称以 Player_ 开头）
            const hasUnsyncedPlayers = match.players?.some(p =>
                p.Player?.nickname?.startsWith('Player_')
            );

            if (hasUnsyncedPlayers) {
                const timer = setTimeout(() => {
                    loadMatchData(true); // 静默刷新
                    setRefreshCount(1);
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [match, refreshCount]);

    const loadMatchData = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }
            const [matchRes, achievementsRes] = await Promise.all([
                getMatchById(id),
                getMatchAchievements(id)
            ]);

            if (matchRes.success && matchRes.data) {
                setMatch(matchRes.data);
            }
            if (achievementsRes.success && achievementsRes.data) {
                setAchievements(achievementsRes.data);
            }
        } catch (error) {
            if (!silent) {
                message.error('加载比赛数据失败');
            }
            console.error(error);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const handleRequestParse = async () => {
        try {
            setIsRequestingParse(true);
            const res = await requestParse(id);
            if (res.success) {
                message.success('已请求OpenDota解析，请稍后刷新数据');
                // 重新加载数据以更新 parse_requested 状态
                await loadMatchData(true);
            }
        } catch (error) {
            if (error.response?.data?.error?.code === 'ALREADY_REQUESTED') {
                message.warning('已经请求过解析，请稍后刷新数据');
            } else {
                message.error('请求解析失败');
            }
            console.error(error);
        } finally {
            setIsRequestingParse(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            const res = await refreshMatch(id);
            if (res.success) {
                message.success('比赛数据已刷新');
                setMatch(res.data.match);
                // 重新加载成就数据
                const achievementsRes = await getMatchAchievements(id);
                if (achievementsRes.success) {
                    setAchievements(achievementsRes.data);
                }
            }
        } catch (error) {
            message.error('刷新数据失败');
            console.error(error);
        } finally {
            setIsRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="match-detail-container">
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="match-detail-container">
                <div className="error-container">
                    <h2>比赛不存在</h2>
                    <Button onClick={() => navigate('/matches')}>返回列表</Button>
                </div>
            </div>
        );
    }

    const radiantPlayers = match.players?.filter(p => p.team === 'radiant') || [];
    const direPlayers = match.players?.filter(p => p.team === 'dire') || [];

    return (
        <div className="match-detail-container">
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/matches')}
                className="back-button"
            >
                返回列表
            </Button>

            {/* 解析状态提示和操作按钮 */}
            {!match.is_parsed && (
                <Alert
                    message="比赛数据未完全解析"
                    description="此比赛尚未完全解析，部分成就数据可能不可用。您可以请求OpenDota解析此比赛。"
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    action={
                        <div style={{ display: 'flex', gap: 8 }}>
                            {!match.parse_requested ? (
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<ThunderboltOutlined />}
                                    loading={isRequestingParse}
                                    onClick={handleRequestParse}
                                >
                                    请求解析
                                </Button>
                            ) : (
                                <Button
                                    size="small"
                                    disabled
                                >
                                    解析中...
                                </Button>
                            )}
                            <Button
                                size="small"
                                icon={<ReloadOutlined />}
                                loading={isRefreshing}
                                onClick={handleRefresh}
                            >
                                刷新数据
                            </Button>
                        </div>
                    }
                />
            )}

            {/* 已解析的比赛也显示刷新按钮 */}
            {match.is_parsed && (
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button
                        icon={<ReloadOutlined />}
                        loading={isRefreshing}
                        onClick={handleRefresh}
                    >
                        刷新数据
                    </Button>
                </div>
            )}

            <MatchHeader match={match} />

            <TeamTable
                team="radiant"
                teamName={match.radiant_team_name || '天辉'}
                players={radiantPlayers}
                isWinner={match.radiant_win}
            />

            <TeamTable
                team="dire"
                teamName={match.dire_team_name || '夜魇'}
                players={direPlayers}
                isWinner={!match.radiant_win}
            />

            {achievements.length > 0 && (
                <AchievementList achievements={achievements} />
            )}
        </div>
    );
};

export default MatchDetail;
