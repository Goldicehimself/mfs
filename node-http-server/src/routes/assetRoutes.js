// Asset Routes
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { protect, requireScope } = require('../middleware/auth');
const { uploadAssetSingle, uploadAssetMultiple } = require('../../multer/multer');

router.get('/', protect, requireScope('assets:read'), assetController.getAssets);
router.get('/:id', protect, requireScope('assets:read'), assetController.getAssetById);
router.post('/', protect, requireScope('assets:write'), uploadAssetSingle, assetController.createAsset);
router.put('/:id', protect, requireScope('assets:write'), uploadAssetSingle, assetController.updateAsset);
router.delete('/:id', protect, requireScope('assets:write'), assetController.deleteAsset);

module.exports = router;
