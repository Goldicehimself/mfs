// Notification Routes
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, notificationController.getNotifications);
router.patch('/:id/read', protect, notificationController.markNotificationRead);
router.patch('/read-all', protect, notificationController.markAllNotificationsRead);

module.exports = router;
