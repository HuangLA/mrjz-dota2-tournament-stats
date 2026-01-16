const { Hero } = require('../models');

class HeroController {
    /**
     * 获取英雄列表
     * GET /api/heroes
     */
    async getHeroes(req, res, next) {
        try {
            const heroes = await Hero.findAll({
                order: [['hero_id', 'ASC']]
            });

            res.json({
                success: true,
                data: heroes
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 获取英雄详情
     * GET /api/heroes/:id
     */
    async getHeroById(req, res, next) {
        try {
            const { id } = req.params;

            const hero = await Hero.findByPk(id);

            if (!hero) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: '英雄不存在'
                    }
                });
            }

            res.json({
                success: true,
                data: hero
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new HeroController();
