// Asset Routes
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { protect } = require('../middleware/auth');

router.get('/', assetController.getAssets);
router.get('/:id', assetController.getAssetById);
router.post('/', protect, assetController.createAsset);
router.put('/:id', protect, assetController.updateAsset);
router.delete('/:id', protect, assetController.deleteAsset);

module.exports = router;
