const express = require('express');
const router = express.Router();

/**
 * 健康检查端点
 * 用于 Docker 健康检查和监控
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;
