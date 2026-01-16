const cron = require('node-cron');
const syncService = require('../services/syncService');
require('dotenv').config();

class SyncJob {
    constructor() {
        this.leagueId = process.env.LEAGUE_ID || null;
        this.cronExpression = process.env.SYNC_CRON || '0 22 * * *'; // 默认每天晚上10点
        this.isRunning = false;
    }

    /**
     * 启动定时任务
     */
    start() {
        if (!this.leagueId) {
            console.warn('⚠️ LEAGUE_ID not configured, sync job not started');
            return;
        }

        console.log(`⏰ Sync job scheduled: ${this.cronExpression}`);
        console.log(`📊 League ID: ${this.leagueId}`);

        // 创建定时任务
        cron.schedule(this.cronExpression, async () => {
            await this.runSync();
        });

        console.log('✅ Sync job started');
    }

    /**
     * 执行同步任务
     */
    async runSync() {
        if (this.isRunning) {
            console.log('⚠️ Sync already running, skipping...');
            return;
        }

        this.isRunning = true;
        const startTime = Date.now();

        try {
            console.log('🚀 Starting scheduled sync...');

            // 1. 同步英雄数据（不常变化，可选）
            // await syncService.syncHeroes();

            // 2. 同步比赛数据
            const result = await syncService.syncMatches(this.leagueId);

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ Scheduled sync completed in ${duration}s`);
            console.log(`📊 Result: ${result.synced} new matches synced, ${result.total} total matches`);

        } catch (error) {
            console.error('❌ Scheduled sync failed:', error.message);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * 手动触发同步
     */
    async manualSync() {
        console.log('🔄 Manual sync triggered');
        await this.runSync();
    }
}

module.exports = new SyncJob();
