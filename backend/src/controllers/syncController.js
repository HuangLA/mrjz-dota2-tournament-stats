const syncService = require('../services/syncService');

class SyncController {
    /**
     * 手动触发同步
     * POST /api/sync/matches?league_id=xxx
     */
    async syncMatches(req, res, next) {
        try {
            const { league_id } = req.query;

            if (!league_id) {
                return res.status(400).json({
                    success: false,
                    message: 'league_id is required'
                });
            }

            const leagueId = parseInt(league_id);
            console.log(`🔄 Manual sync triggered for league ${leagueId}`);

            // 触发同步（异步执行，不阻塞响应）
            syncService.syncMatches(leagueId)
                .then(result => {
                    console.log(`✅ Sync completed: ${result.synced} new matches`);
                })
                .catch(error => {
                    console.error(`❌ Sync failed:`, error);
                });

            // 立即返回响应
            res.json({
                success: true,
                message: 'Sync started',
                league_id: leagueId
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SyncController();
