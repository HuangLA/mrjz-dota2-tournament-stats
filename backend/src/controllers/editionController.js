const { sequelize } = require('../config/database');

class EditionController {
    /**
     * 获取所有赛季列表（公开接口）
     * GET /api/editions
     */
    async getEditions(req, res, next) {
        try {
            const [editions] = await sequelize.query(`
                SELECT 
                    e.edition_number,
                    e.edition_name,
                    e.start_date,
                    e.end_date,
                    e.description,
                    COUNT(DISTINCT m.match_id) as match_count,
                    COUNT(DISTINCT m.radiant_team_id) + COUNT(DISTINCT m.dire_team_id) as team_count
                FROM editions e
                LEFT JOIN matches m ON e.edition_number = m.edition
                WHERE e.is_active = TRUE
                GROUP BY e.edition_number, e.edition_name, e.start_date, e.end_date, e.description
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
     * 获取当前赛季
     * GET /api/editions/current
     */
    async getCurrentEdition(req, res, next) {
        try {
            const [edition] = await sequelize.query(`
                SELECT 
                    edition_number,
                    edition_name,
                    start_date,
                    end_date,
                    description
                FROM editions
                WHERE is_active = TRUE
                  AND start_date <= CURDATE()
                  AND (end_date >= CURDATE() OR end_date IS NULL)
                ORDER BY edition_number DESC
                LIMIT 1
            `);

            if (edition.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: '未找到当前赛季'
                    }
                });
            }

            res.json({
                success: true,
                data: edition[0]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EditionController();
