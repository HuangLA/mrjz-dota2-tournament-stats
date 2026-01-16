/**
 * 统一错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Sequelize 验证错误
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: err.errors.map(e => e.message).join(', ')
            }
        });
    }

    // Sequelize 唯一约束错误
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            success: false,
            error: {
                code: 'DUPLICATE_ERROR',
                message: '数据已存在'
            }
        });
    }

    // 自定义错误
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code || 'ERROR',
                message: err.message
            }
        });
    }

    // 默认服务器错误
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: '服务器内部错误'
        }
    });
};

module.exports = errorHandler;
