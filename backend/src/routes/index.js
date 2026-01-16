const express = require('express');
const router = express.Router();

// 导入各个路由模块
const matchesRouter = require('./matches');
const playersRouter = require('./players');
const heroesRouter = require('./heroes');
const achievementsRouter = require('./achievements');
const statsRouter = require('./stats');
const teamsRouter = require('./teams');
const editionsRouter = require('./editions');
const adminEditionsRouter = require('./adminEditions');
const syncRouter = require('./sync');

// 注册路由
router.use('/matches', matchesRouter);
router.use('/players', playersRouter);
router.use('/heroes', heroesRouter);
router.use('/achievements', achievementsRouter);
router.use('/stats', statsRouter);
router.use('/teams', teamsRouter);
router.use('/editions', editionsRouter);
router.use('/admin/editions', adminEditionsRouter);
router.use('/sync', syncRouter);

// API 根路径
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'MRJZ API v1.0',
        endpoints: {
            matches: '/api/matches',
            players: '/api/players',
            heroes: '/api/heroes',
            achievements: '/api/achievements',
            stats: '/api/stats'
        }
    });
});

module.exports = router;
