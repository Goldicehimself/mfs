// Auth Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest, validateQuery } = require('../middleware/validation');
const { updateUserSchema, registerSchema, registerOrgSchema, inviteSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyUserEmailQuerySchema, resendUserEmailBodySchema } = require('../validators/userValidator');
const { uploadAvatar, uploadCertificateMultiple } = require('../../multer/multer');
const path = require('path');

const attachAvatarPath = (req, res, next) => {
  if (req.file?.path) {
    req.body.avatar = req.file.path.split(path.sep).join('/');
  }
  next();
};

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/register-org', validateRequest(registerOrgSchema), authController.registerOrganization);
router.post('/invite', protect, authorize('admin', 'facility_manager'), validateRequest(inviteSchema), authController.createInvite);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);
router.post('/logout', protect, authController.logout);
router.get('/verify', protect, authController.verifyToken);
router.get('/verify-user-email', validateQuery(verifyUserEmailQuerySchema), authController.verifyUserEmail);
router.post('/resend-verify-user-email', validateRequest(resendUserEmailBodySchema), authController.resendUserEmailVerification);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, uploadAvatar, attachAvatarPath, validateRequest(updateUserSchema), authController.updateProfile);
router.post('/certificates', protect, uploadCertificateMultiple, authController.uploadCertificates);

module.exports = router;
