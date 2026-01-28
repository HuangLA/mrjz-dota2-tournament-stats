/**
 * 分页中间件
 */
const pagination = (req, res, next) => {
    // 从查询参数获取分页信息
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // 限制每页最大数量
    const maxLimit = 1000;
    const finalLimit = Math.min(limit, maxLimit);

    // 计算偏移量
    const offset = (page - 1) * finalLimit;

    // 将分页信息附加到 req 对象
    req.pagination = {
        page,
        limit: finalLimit,
        offset
    };

    next();
};

/**
 * 创建分页响应
 */
const createPaginatedResponse = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);

    return {
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
};

module.exports = {
    pagination,
    createPaginatedResponse
};
