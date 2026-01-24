const syncService = require('../services/syncService');

/**
 * 获取同步状态
 */
exports.getSyncStatus = async (req, res, next) => {
    try {
        const status = syncService.getSyncStatus();

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 触发同步
 */
exports.triggerSync = async (req, res, next) => {
    try {
        const { league_id } = req.query;

        if (!league_id) {
            return res.status(400).json({
                success: false,
                error: 'league_id is required'
            });
        }

        const leagueId = parseInt(league_id);

        if (isNaN(leagueId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid league_id'
            });
        }

        // 检查是否已经在同步中
        if (syncService.getSyncStatus().isRunning) {
            return res.status(409).json({
                success: false,
                error: 'Sync is already in progress'
            });
        }

        // 异步触发同步（不等待完成）
        syncService.syncMatches(leagueId).catch(error => {
            console.error('Sync error:', error);
        });

        res.json({
            success: true,
            message: 'Sync started',
            data: syncService.getSyncStatus()
        });
    } catch (error) {
        next(error);
    }
};
