const express = require('express');
const router = express.Router();
const adminEditionController = require('../controllers/adminEditionController');

/**
 * @route   GET /api/admin/editions
 * @desc    获取所有赛季（包括未启用的）
 * @access  Admin
 */
router.get('/', adminEditionController.getAllEditions);

/**
 * @route   POST /api/admin/editions
 * @desc    创建新赛季
 * @access  Admin
 */
router.post('/', adminEditionController.createEdition);

/**
 * @route   PUT /api/admin/editions/:id
 * @desc    更新赛季
 * @access  Admin
 */
router.put('/:id', adminEditionController.updateEdition);

/**
 * @route   DELETE /api/admin/editions/:id
 * @desc    删除赛季
 * @access  Admin
 */
router.delete('/:id', adminEditionController.deleteEdition);

/**
 * @route   POST /api/admin/editions/reassign
 * @desc    重新分配所有比赛的赛季
 * @access  Admin
 */
router.post('/reassign', adminEditionController.reassignEditions);

module.exports = router;
