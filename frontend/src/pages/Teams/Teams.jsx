import { useState, useEffect } from 'react';
import { Spin, message, Select } from 'antd';
import { getTeams } from '../../api/teams';
import TeamCard from './components/TeamCard';
import './Teams.css';

const { Option } = Select;

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshCount, setRefreshCount] = useState(0);
    const [selectedLeague, setSelectedLeague] = useState(18365); // 默认第二届

    useEffect(() => {
        loadTeams();
    }, [selectedLeague]);

    // 自动刷新逻辑：如果有未同步的玩家，3秒后刷新一次
    useEffect(() => {
        if (teams.length > 0 && refreshCount < 3) {
            const hasUnsyncedPlayers = teams.some(team =>
                team.players && team.players.some(p =>
                    p.nickname && p.nickname.startsWith('Player_')
                )
            );

            if (hasUnsyncedPlayers) {
                const timer = setTimeout(() => {
                    loadTeams(true); // 静默刷新
                    setRefreshCount(prev => prev + 1);
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [teams, refreshCount]);

    const loadTeams = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }
            const response = await getTeams(selectedLeague);
            if (response.success) {
                setTeams(response.data);
            }
        } catch (error) {
            if (!silent) {
                message.error('加载战队数据失败');
            }
            console.error(error);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const handleLeagueChange = (value) => {
        setSelectedLeague(value);
        setRefreshCount(0); // 重置刷新计数
    };

    if (loading) {
        return (
            <div className="teams-container">
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    return (
        <div className="teams-container">
            <div className="teams-header">
                <div className="header-left">
                    <h1>战队列表</h1>
                    <div className="teams-stats">
                        共 {teams.length} 支战队
                    </div>
                </div>
                <div className="header-right">
                    <Select
                        value={selectedLeague}
                        onChange={handleLeagueChange}
                        className="edition-selector"
                        style={{ width: 180 }}
                    >
                        <Option value={null}>全部联赛</Option>
                        <Option value={18365}>第二届 (18365)</Option>
                        <Option value={17485}>第一届 (17485)</Option>
                    </Select>
                </div>
            </div>

            <div className="teams-grid">
                {teams.map(team => (
                    <TeamCard key={team.team_id} team={team} />
                ))}
            </div>

            {teams.length === 0 && (
                <div className="empty-state">
                    <p>暂无战队数据</p>
                </div>
            )}
        </div>
    );
};

export default Teams;
