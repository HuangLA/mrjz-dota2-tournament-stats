const express = require('express');
const router = express.Router();
const heroController = require('../controllers/heroController');

// 英雄列表
router.get('/', heroController.getHeroes);

// 英雄详情
router.get('/:id', heroController.getHeroById);

module.exports = router;
