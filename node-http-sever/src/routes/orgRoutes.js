// Organization Routes
const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest, validateQuery } = require('../middleware/validation');
const { listInvitesQuerySchema, setUserActiveSchema } = require('../validators/orgValidator');

router.get('/members', protect, authorize('admin', 'facility_manager'), orgController.listMembers);
router.get('/invites', protect, authorize('admin', 'facility_manager'), validateQuery(listInvitesQuerySchema), orgController.listInvites);
router.delete('/invites/:code', protect, authorize('admin'), orgController.revokeInvite);
router.patch('/disable', protect, authorize('admin'), orgController.disableOrganization);
router.patch('/enable', protect, authorize('admin'), orgController.enableOrganization);
router.patch('/users/:id/active', protect, authorize('admin'), validateRequest(setUserActiveSchema), orgController.setUserActiveStatus);

module.exports = router;
