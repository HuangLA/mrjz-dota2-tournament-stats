const express = require('express');
const router = express.Router();
const editionController = require('../controllers/editionController');

/**
 * @route   GET /api/editions
 * @desc    获取所有赛季列表
 * @access  Public
 */
router.get('/', editionController.getEditions);

/**
 * @route   GET /api/editions/current
 * @desc    获取当前赛季
 * @access  Public
 */
router.get('/current', editionController.getCurrentEdition);

module.exports = router;
