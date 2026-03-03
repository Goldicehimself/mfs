const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const uploadDirs = ['uploads/assets', 'uploads/avatars', 'uploads/certificates', 'uploads/documents', 'uploads/workorder-photos'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ========== ASSET UPLOADS (Images only) ==========
const assetStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/assets/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, `asset-${uniqueSuffix}${fileExtension}`);
  }
});

const assetUpload = multer({
  storage: assetStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and JPG are allowed.'), false);
    }
    cb(null, true);
  }
});

// ========== AVATAR/PROFILE UPLOADS (Images only) ==========
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${fileExtension}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and JPG are allowed.'), false);
    }
    cb(null, true);
  }
});

// ========== CERTIFICATE UPLOADS (PDF and Images) ==========
const certificateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/certificates/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, `certificate-${uniqueSuffix}${fileExtension}`);
  }
});

const certificateUpload = multer({
  storage: certificateStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, JPG, and PDF are allowed.'), false);
    }
    cb(null, true);
  }
});

// ========== DOCUMENT UPLOADS (PDF, Word, Excel, etc.) ==========
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, `document-${uniqueSuffix}${fileExtension}`);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'application/csv'
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only PDF, Word, Excel, and TXT are allowed.'), false);
    }
    cb(null, true);
  }
});

// ========== WORKORDER PHOTO UPLOADS (Images only) ==========
const workOrderPhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/workorder-photos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, `workorder-photo-${uniqueSuffix}${fileExtension}`);
  }
});

const workOrderPhotoUpload = multer({
  storage: workOrderPhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and JPG are allowed.'), false);
    }
    cb(null, true);
  }
});

// ========== EXPORT HANDLERS ==========
module.exports = {
  // Asset uploads
  uploadAssetSingle: assetUpload.single('imageCover'),
  uploadAssetMultiple: assetUpload.array('images', 5),

  // Avatar uploads
  uploadAvatar: avatarUpload.single('avatar'),

  // Certificate uploads
  uploadCertificateSingle: certificateUpload.single('certificate'),
  uploadCertificateMultiple: certificateUpload.array('certificates', 10),

  // Document uploads
  uploadDocumentSingle: documentUpload.single('document'),
  uploadDocumentMultiple: documentUpload.array('documents', 5),
  uploadAssetImport: documentUpload.single('file'),

  // WorkOrder photo uploads
  uploadWorkOrderPhotoSingle: workOrderPhotoUpload.single('photo'),
  uploadWorkOrderPhotoMultiple: workOrderPhotoUpload.array('photos', 10)
};
