// Report Routes
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/', protect, reportController.getReports);
router.get('/my-reports', protect, reportController.getMyReports);
router.get('/type/:type', protect, reportController.getReportsByType);
router.get('/:id', protect, reportController.getReportById);
router.post('/', protect, reportController.createReport);
router.post('/generate', protect, reportController.generateReport);
router.put('/:id', protect, reportController.updateReport);
router.delete('/:id', protect, reportController.deleteReport);

module.exports = router;
