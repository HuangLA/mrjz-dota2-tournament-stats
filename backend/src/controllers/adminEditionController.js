const { sequelize } = require('../config/database');

class AdminEditionController {
    /**
     * 获取所有赛季（包括未启用的）
     * GET /api/admin/editions
     */
    async getAllEditions(req, res, next) {
        try {
            const [editions] = await sequelize.query(`
                SELECT 
                    e.*,
                    COUNT(DISTINCT m.match_id) as match_count,
                    COUNT(DISTINCT m.radiant_team_id) + COUNT(DISTINCT m.dire_team_id) as team_count
                FROM editions e
                LEFT JOIN matches m ON e.edition_number = m.edition
                GROUP BY e.edition_id
                ORDER BY e.edition_number
            `);

            res.json({
                success: true,
                data: editions
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 创建新赛季
     * POST /api/admin/editions
     */
    async createEdition(req, res, next) {
        try {
            const { edition_number, edition_name, start_date, end_date, description } = req.body;

            // 验证必填字段
            if (!edition_number || !edition_name || !start_date) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: '缺少必填字段：edition_number, edition_name, start_date'
                    }
                });
            }

            // 检查届数是否已存在
            const [existing] = await sequelize.query(`
                SELECT edition_id FROM editions WHERE edition_number = ?
            `, {
                replacements: [edition_number]
            });

            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'DUPLICATE_EDITION',
                        message: `第${edition_number}届已存在`
                    }
                });
            }

            // 插入新赛季
            await sequelize.query(`
                INSERT INTO editions (edition_number, edition_name, start_date, end_date, description)
                VALUES (?, ?, ?, ?, ?)
            `, {
                replacements: [edition_number, edition_name, start_date, end_date || null, description || null]
            });

            res.json({
                success: true,
                message: `第${edition_number}届创建成功`
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 更新赛季
     * PUT /api/admin/editions/:id
     */
    async updateEdition(req, res, next) {
        try {
            const { id } = req.params;
            const { edition_name, start_date, end_date, description, is_active } = req.body;

            const updates = [];
            const replacements = [];

            if (edition_name !== undefined) {
                updates.push('edition_name = ?');
                replacements.push(edition_name);
            }
            if (start_date !== undefined) {
                updates.push('start_date = ?');
                replacements.push(start_date);
            }
            if (end_date !== undefined) {
                updates.push('end_date = ?');
                replacements.push(end_date);
            }
            if (description !== undefined) {
                updates.push('description = ?');
                replacements.push(description);
            }
            if (is_active !== undefined) {
                updates.push('is_active = ?');
                replacements.push(is_active);
            }

            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'NO_UPDATES',
                        message: '没有需要更新的字段'
                    }
                });
            }

            replacements.push(id);

            await sequelize.query(`
                UPDATE editions 
                SET ${updates.join(', ')}
                WHERE edition_id = ?
            `, {
                replacements
            });

            res.json({
                success: true,
                message: '赛季更新成功'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 删除赛季
     * DELETE /api/admin/editions/:id
     */
    async deleteEdition(req, res, next) {
        try {
            const { id } = req.params;

            // 检查是否有关联的比赛
            const [matches] = await sequelize.query(`
                SELECT COUNT(*) as count
                FROM matches m
                JOIN editions e ON m.edition = e.edition_number
                WHERE e.edition_id = ?
            `, {
                replacements: [id]
            });

            if (matches[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'HAS_MATCHES',
                        message: `该赛季有${matches[0].count}场比赛，无法删除`
                    }
                });
            }

            await sequelize.query(`
                DELETE FROM editions WHERE edition_id = ?
            `, {
                replacements: [id]
            });

            res.json({
                success: true,
                message: '赛季删除成功'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 重新分配所有比赛的赛季
     * POST /api/admin/editions/reassign
     */
    async reassignEditions(req, res, next) {
        try {
            // 获取所有赛季配置
            const [editions] = await sequelize.query(`
                SELECT edition_number, start_date, end_date
                FROM editions
                WHERE is_active = TRUE
                ORDER BY start_date
            `);

            let totalUpdated = 0;

            // 为每个赛季更新对应的比赛
            for (const edition of editions) {
                const endCondition = edition.end_date
                    ? `AND start_time <= '${edition.end_date} 23:59:59'`
                    : '';

                const [result] = await sequelize.query(`
                    UPDATE matches 
                    SET edition = ?
                    WHERE start_time >= '${edition.start_date} 00:00:00'
                    ${endCondition}
                `, {
                    replacements: [edition.edition_number]
                });

                totalUpdated += result.affectedRows || 0;
            }

            res.json({
                success: true,
                updated: totalUpdated,
                message: `已重新分配${totalUpdated}场比赛的赛季`
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminEditionController();
