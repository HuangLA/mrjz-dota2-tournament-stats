const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const { initModels } = require('./models');
const syncJob = require('./jobs/syncJob');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由
app.use('/api', apiRoutes);

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

// 启动服务器
async function startServer() {
    try {
        // 1. 测试数据库连接
        await testConnection();

        // 2. 初始化模型
        await initModels();

        // 3. 启动定时任务
        syncJob.start();

        // 4. 启动 HTTP 服务器
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Server startup failed:', error.message);
        process.exit(1);
    }
}

startServer();

module.exports = app;
