// Work Order Routes
const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');
const { protect } = require('../middleware/auth');

router.get('/', workOrderController.getWorkOrders);
router.get('/:id', workOrderController.getWorkOrderById);
router.post('/', protect, workOrderController.createWorkOrder);
router.put('/:id', protect, workOrderController.updateWorkOrder);
router.patch('/:id/status', protect, workOrderController.updateWorkOrderStatus);
router.post('/:id/assign', protect, workOrderController.assignWorkOrder);
router.post('/:id/comments', protect, workOrderController.addComment);
router.delete('/:id', protect, workOrderController.deleteWorkOrder);

module.exports = router;
