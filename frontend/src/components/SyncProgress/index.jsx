import React, { useState, useEffect } from 'react';
import { Progress, message } from 'antd';
import { getSyncStatus } from '../../api/sync';
import './SyncProgress.css';

const SyncProgress = ({ visible, onComplete }) => {
    const [status, setStatus] = useState(null);
    const [polling, setPolling] = useState(null);

    useEffect(() => {
        if (visible) {
            startPolling();
        } else {
            stopPolling();
        }
        return () => stopPolling();
    }, [visible]);

    const startPolling = () => {
        // 立即获取一次状态
        fetchStatus();

        // 每2秒轮询一次
        const interval = setInterval(async () => {
            await fetchStatus();
        }, 2000);

        setPolling(interval);
    };

    const fetchStatus = async () => {
        try {
            const res = await getSyncStatus();
            setStatus(res.data);

            // 如果同步完成
            if (res.data && !res.data.isRunning && res.data.progress.total > 0) {
                stopPolling();
                message.success(`数据同步完成！成功同步 ${res.data.progress.current} 场比赛`);
                setTimeout(() => {
                    onComplete?.();
                }, 500);
            }
        } catch (error) {
            console.error('获取同步状态失败:', error);
        }
    };

    const stopPolling = () => {
        if (polling) {
            clearInterval(polling);
            setPolling(null);
        }
    };

    if (!visible || !status) return null;

    const { progress, currentMatch, duration } = status;
    const percent = progress.total > 0
        ? Math.round((progress.current / progress.total) * 100)
        : 0;

    const durationSeconds = Math.round(duration / 1000);

    return (
        <div className="sync-progress-overlay">
            <div className="sync-progress-content">
                <h3>🔄 正在同步比赛数据...</h3>

                <div className="sync-progress-wrapper">
                    <Progress
                        percent={percent}
                        status="active"
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }}
                        strokeWidth={12}
                    />
                </div>

                <div className="sync-info">
                    <p className="sync-count">
                        <strong>{progress.current}</strong> / {progress.total} 场比赛
                    </p>

                    {currentMatch && (
                        <p className="sync-detail">
                            正在同步: Match #{currentMatch.matchId}
                        </p>
                    )}

                    <p className="sync-time">
                        已用时: {durationSeconds} 秒
                    </p>
                </div>

                <p className="sync-tip">
                    ⏳ 请稍候，同步完成后将自动刷新列表
                </p>
            </div>
        </div>
    );
};

export default SyncProgress;
