// Vendor Routes
const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');

router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);
router.post('/', protect, vendorController.createVendor);
router.put('/:id', protect, vendorController.updateVendor);
router.delete('/:id', protect, vendorController.deleteVendor);

module.exports = router;
