// Asset Routes
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const { uploadAssetSingle, uploadAssetMultiple } = require('../../multer/multer');

router.get('/', protect, assetController.getAssets);
router.get('/:id', protect, assetController.getAssetById);
router.post('/', protect, uploadAssetSingle, assetController.createAsset);
router.put('/:id', protect, uploadAssetSingle, assetController.updateAsset);
router.delete('/:id', protect, assetController.deleteAsset);

module.exports = router;
