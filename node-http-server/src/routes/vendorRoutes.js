// Vendor Routes
const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect, requireScope } = require('../middleware/auth');

router.get('/', protect, requireScope('vendors:read'), vendorController.getVendors);
router.get('/:id', protect, requireScope('vendors:read'), vendorController.getVendorById);
router.post('/', protect, requireScope('vendors:write'), vendorController.createVendor);
router.put('/:id', protect, requireScope('vendors:write'), vendorController.updateVendor);
router.delete('/:id', protect, requireScope('vendors:write'), vendorController.deleteVendor);

module.exports = router;
